import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Edit3, Eye, Trash2, Globe, Clock, 
  Calendar, User, AlertCircle, RefreshCw, FileText, CheckCircle2 
} from 'lucide-react';
import BlogPostPreviewModal from './BlogPostPreviewModal';
import { deleteBlogPost, unpublishBlogPost, saveBlogPost } from '../../services/blogService';
import { BLOG_CATEGORIES } from '../../data/initialBlogPosts';

export default function BlogPostsList({ 
  posts = [], 
  isLoading = false, 
  onRefresh, 
  onAddNewPost, 
  onEditPost 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [previewPost, setPreviewPost] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      // Status filter
      if (statusFilter !== 'all' && p.status !== statusFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'All' && p.category !== categoryFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const titleMatch = p.title?.toLowerCase().includes(query);
        const excerptMatch = p.excerpt?.toLowerCase().includes(query);
        const authorMatch = p.author_name?.toLowerCase().includes(query);
        const slugMatch = p.slug?.toLowerCase().includes(query);
        return titleMatch || excerptMatch || authorMatch || slugMatch;
      }
      return true;
    });
  }, [posts, statusFilter, categoryFilter, searchTerm]);

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    try {
      setIsDeleting(true);
      await deleteBlogPost(postToDelete.id);
      showToast('Article deleted successfully.');
      setPostToDelete(null);
      onRefresh?.();
    } catch (err) {
      alert(`Failed to delete post: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Quick Unpublish
  const handleToggleStatus = async (post) => {
    try {
      if (post.status === 'published') {
        await unpublishBlogPost(post.id);
        showToast('Article unpublished.');
      } else {
        await saveBlogPost(post, { publish: true });
        showToast('Article published live!');
      }
      onRefresh?.();
    } catch (err) {
      alert(`Action failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Primary Call to Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5dfd7]">
        <div>
          <h1 
            className="text-2xl text-[#1a1814] font-normal tracking-wide"
            style={{ fontFamily: 'var(--font-family-editorial)' }}
          >
            Blog & Editorial Journal
          </h1>
          <p className="text-xs text-[#8c867f] mt-0.5">
            Manage fashion stories, artisanal styling guides, and SEO metadata directly from the atelier.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 text-[#6b655e] hover:text-[#1a1814] hover:bg-[#ebe6e0] transition-colors cursor-pointer border border-[#d8d2ca] bg-white"
            title="Refresh articles from database"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-[#c5a880]' : ''} />
          </button>

          <button
            type="button"
            onClick={onAddNewPost}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a1814] text-white hover:bg-[#c5a880] text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus size={15} />
            <span>Add New Post</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-800">×</button>
        </div>
      )}

      {/* Search & Filtering Bar */}
      <div className="bg-white p-4 border border-[#e5dfd7] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c867f]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, author, keyword, or slug..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#d8d2ca] text-[#1a1814] focus:outline-none focus:border-[#c5a880]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center border border-[#d8d2ca] bg-[#faf8f6] p-0.5 text-xs">
            {['all', 'published', 'draft'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 uppercase tracking-wider text-[11px] font-semibold transition-colors cursor-pointer ${
                  statusFilter === st 
                    ? 'bg-white text-[#1a1814] shadow-xs' 
                    : 'text-[#8c867f] hover:text-[#1a1814]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border border-[#d8d2ca] text-xs text-[#1a1814] bg-white focus:outline-none focus:border-[#c5a880]"
          >
            {BLOG_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Blog Posts Table */}
      <div className="bg-white border border-[#e5dfd7] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#8c867f] gap-3">
            <RefreshCw size={24} className="animate-spin text-[#c5a880]" />
            <span className="text-xs uppercase tracking-widest font-medium">Loading Editorial Articles...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#faf8f6] border border-[#e5dfd7] mx-auto flex items-center justify-center text-[#8c867f]">
              <FileText size={20} />
            </div>
            <h3 className="text-sm font-semibold text-[#1a1814] uppercase tracking-wider">
              No Blog Posts Found
            </h3>
            <p className="text-xs text-[#8c867f] max-w-sm mx-auto">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'All'
                ? 'No articles match your current search or filter criteria.'
                : 'Your blog archive is currently empty. Compose your first fashion article!'}
            </p>
            <button
              type="button"
              onClick={onAddNewPost}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a1814] text-white hover:bg-[#c5a880] text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Compose First Article</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e5dfd7] bg-[#faf8f6] text-[11px] uppercase tracking-wider text-[#6b655e] font-bold">
                  <th className="py-3 px-4 w-16">Cover</th>
                  <th className="py-3 px-4">Article Title & Permalink</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Published Date</th>
                  <th className="py-3 px-4">Last Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0eae2] text-xs text-[#2a2622]">
                {filteredPosts.map((post) => {
                  const isPublished = post.status === 'published';
                  const pubDate = post.published_at 
                    ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—';
                  const updDate = post.updated_at 
                    ? new Date(post.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—';

                  return (
                    <tr key={post.id} className="hover:bg-[#fbf9f7] transition-colors">
                      
                      {/* Cover Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 bg-[#faf8f6] border border-[#e5dfd7] overflow-hidden flex items-center justify-center shrink-0">
                          {post.cover_image_url ? (
                            <img
                              src={post.cover_image_url}
                              alt={post.cover_image_alt || post.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/products/yasraf-meerab-black-1.png';
                              }}
                            />
                          ) : (
                            <FileText size={16} className="text-[#8c867f]" />
                          )}
                        </div>
                      </td>

                      {/* Title & Slug */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-[#1a1814] truncate" title={post.title}>
                          {post.title}
                        </div>
                        <div className="text-[11px] text-[#8c867f] font-mono truncate">
                          /blog/{post.slug}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider bg-[#faf8f6] border border-[#e5dfd7] text-[#6b655e] font-medium">
                          {post.category || 'General'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${
                          isPublished
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                          {post.status}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-3 px-4 text-[#6b655e]">
                        {post.author_name || 'Editorial Team'}
                      </td>

                      {/* Published Date */}
                      <td className="py-3 px-4 text-[#6b655e] whitespace-nowrap">
                        {pubDate}
                      </td>

                      {/* Last Updated */}
                      <td className="py-3 px-4 text-[#8c867f] whitespace-nowrap">
                        {updDate}
                      </td>

                      {/* Actions: Edit, Preview, Delete */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 justify-end">
                          
                          {/* Preview Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewPost(post)}
                            className="p-1.5 text-[#6b655e] hover:text-[#1a1814] hover:bg-[#ebe6e0] transition-colors cursor-pointer"
                            title="Preview article"
                            aria-label="Preview article"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => onEditPost(post)}
                            className="p-1.5 text-[#1a1814] hover:text-[#c5a880] hover:bg-[#ebe6e0] transition-colors cursor-pointer"
                            title="Edit article"
                            aria-label="Edit article"
                          >
                            <Edit3 size={15} />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setPostToDelete(post)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete article"
                            aria-label="Delete article"
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 shadow-2xl border border-red-200 space-y-4">
            <h4 className="text-sm uppercase tracking-wider font-bold text-red-700 flex items-center gap-2">
              <AlertCircle size={16} /> Confirm Deletion
            </h4>
            <p className="text-xs text-[#4a4640] leading-relaxed">
              Are you sure you want to permanently delete <strong>"{postToDelete.title}"</strong>? This will remove the article and cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPostToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs uppercase tracking-wider border border-[#d8d2ca] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs uppercase tracking-wider bg-red-700 text-white hover:bg-red-800 transition-colors cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <BlogPostPreviewModal
        post={previewPost}
        isOpen={Boolean(previewPost)}
        onClose={() => setPreviewPost(null)}
      />

    </div>
  );
}

