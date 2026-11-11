import React, { useState, useEffect, useCallback } from 'react';
import BlogPostsList from './BlogPostsList';
import BlogPostEditor from './BlogPostEditor';
import { getAdminBlogPosts } from '../../services/blogService';
import { ListFilter, PlusCircle } from 'lucide-react';

export default function BlogTab({ initialSubView = 'list' }) {
  const [blogView, setBlogView] = useState(initialSubView); // 'list' | 'new' | 'edit'
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load blog posts
  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminBlogPosts();
      setPosts(data || []);
    } catch (err) {
      console.warn('[BlogTab] Failed to fetch blog posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Handle switching to Add New Post
  const handleAddNew = () => {
    setSelectedPost(null);
    setBlogView('new');
  };

  // Handle Edit Post
  const handleEdit = (post) => {
    setSelectedPost(post);
    setBlogView('edit');
  };

  // Handle Cancel / Return to list
  const handleBackToList = () => {
    setSelectedPost(null);
    setBlogView('list');
    loadPosts();
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-navigation tabs: All Posts / Add New Post */}
      <div className="flex items-center gap-2 border-b border-[#e5dfd7] pb-1">
        <button
          type="button"
          onClick={() => {
            setSelectedPost(null);
            setBlogView('list');
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer ${
            blogView === 'list'
              ? 'border-[#c5a880] text-[#1a1814]'
              : 'border-transparent text-[#8c867f] hover:text-[#1a1814]'
          }`}
        >
          <ListFilter size={14} />
          <span>All Posts ({posts.length})</span>
        </button>

        <button
          type="button"
          onClick={handleAddNew}
          className={`flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-semibold border-b-2 transition-colors cursor-pointer ${
            blogView === 'new'
              ? 'border-[#c5a880] text-[#1a1814]'
              : 'border-transparent text-[#8c867f] hover:text-[#1a1814]'
          }`}
        >
          <PlusCircle size={14} />
          <span>Add New Post</span>
        </button>

        {blogView === 'edit' && selectedPost && (
          <span className="ml-auto text-xs text-[#8c867f] italic truncate max-w-xs">
            Editing: "{selectedPost.title}"
          </span>
        )}
      </div>

      {/* Main View Render */}
      {blogView === 'list' && (
        <BlogPostsList
          posts={posts}
          isLoading={isLoading}
          onRefresh={loadPosts}
          onAddNewPost={handleAddNew}
          onEditPost={handleEdit}
        />
      )}

      {(blogView === 'new' || blogView === 'edit') && (
        <BlogPostEditor
          key={blogView === 'edit' ? (selectedPost?.id || 'edit-post') : 'new-post'}
          post={blogView === 'edit' ? selectedPost : null}
          allPosts={posts}
          onSaveSuccess={handleBackToList}
          onCancel={handleBackToList}
        />
      )}

    </div>
  );
}

