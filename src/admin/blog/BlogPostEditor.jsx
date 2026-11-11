import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, Save, Globe, Eye, Trash2, Upload, AlertCircle, 
  Check, Clock, Tag, Image, FileText, ChevronDown, Sparkles, Loader2, RefreshCw 
} from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import BlogPostPreviewModal from './BlogPostPreviewModal';
import { saveBlogPost, deleteBlogPost, unpublishBlogPost, uploadBlogImage, generateSlug } from '../../services/blogService';
import { BLOG_CATEGORIES } from '../../data/initialBlogPosts';
import { calculateReadingTime } from '../../utils/sanitizeHtml';

export default function BlogPostEditor({ 
  post = null, 
  onSaveSuccess, 
  onCancel,
  allPosts = []
}) {
  const isEditing = Boolean(post && post.id);

  // Form State
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(Boolean(post?.slug));
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [contentHtml, setContentHtml] = useState(post?.content_html || '');
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url || '');
  const [coverImageAlt, setCoverImageAlt] = useState(post?.cover_image_alt || '');
  const [authorName, setAuthorName] = useState(post?.author_name || 'YASRAF Atelier Editorial');
  const [category, setCategory] = useState(post?.category || 'Styling Guide');
  const [tags, setTags] = useState(Array.isArray(post?.tags) ? post.tags : []);
  const [tagInput, setTagInput] = useState('');
  const [readingTime, setReadingTime] = useState(post?.reading_time || 3);
  const [isReadingTimeAuto, setIsReadingTimeAuto] = useState(!post?.reading_time);

  // SEO State
  const [seoTitle, setSeoTitle] = useState(post?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(post?.seo_description || '');
  const [focusKeyword, setFocusKeyword] = useState(post?.focus_keyword || '');
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonical_url || '');
  const [socialImageUrl, setSocialImageUrl] = useState(post?.social_image_url || '');

  // UI & Feedback State
  const [status, setStatus] = useState(post?.status || 'draft');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Auto-generate slug when title changes (unless manually edited)
  useEffect(() => {
    if (!isSlugManuallyEdited && title) {
      const generated = generateSlug(title);
      setSlug(generated);
      if (!canonicalUrl || canonicalUrl.includes('/blog/')) {
        setCanonicalUrl(`https://yasraftextiles.com/blog/${generated}`);
      }
    }
  }, [title, isSlugManuallyEdited, canonicalUrl]);

  // Auto-calculate reading time when content changes
  useEffect(() => {
    if (isReadingTimeAuto && contentHtml) {
      const time = calculateReadingTime(contentHtml);
      setReadingTime(time);
    }
  }, [contentHtml, isReadingTimeAuto]);

  // Auto-populate default SEO fields if left blank
  useEffect(() => {
    if (!seoTitle && title) {
      setSeoTitle(`${title} | YASRAF Textiles`);
    }
  }, [title, seoTitle]);

  useEffect(() => {
    if (!seoDescription && excerpt) {
      setSeoDescription(excerpt.slice(0, 155));
    }
  }, [excerpt, seoDescription]);

  // Cover Image Upload Handler
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      setErrorMessage(null);
      const url = await uploadBlogImage(file);
      setCoverImageUrl(url);
      if (!socialImageUrl) {
        setSocialImageUrl(url);
      }
      if (!coverImageAlt) {
        const cleanAlt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setCoverImageAlt(cleanAlt);
      }
      setSuccessMessage('Cover image uploaded successfully.');
    } catch (err) {
      setErrorMessage(`Cover upload failed: ${err.message}`);
    } finally {
      setIsUploadingCover(false);
    }
  };

  // Tag Management
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Construct current post object
  const currentPostPayload = useMemo(() => ({
    id: post?.id,
    title,
    slug,
    excerpt,
    content_html: contentHtml,
    cover_image_url: coverImageUrl,
    cover_image_alt: coverImageAlt,
    author_name: authorName,
    author_id: post?.author_id || null,
    category,
    tags,
    reading_time: readingTime,
    status,
    seo_title: seoTitle,
    seo_description: seoDescription,
    focus_keyword: focusKeyword,
    canonical_url: canonicalUrl,
    social_image_url: socialImageUrl || coverImageUrl,
    published_at: post?.published_at || null,
    created_at: post?.created_at || null
  }), [post, title, slug, excerpt, contentHtml, coverImageUrl, coverImageAlt, authorName, category, tags, readingTime, status, seoTitle, seoDescription, focusKeyword, canonicalUrl, socialImageUrl]);

  // Save / Publish / Update Action
  const handleSave = async ({ publish = false, unpublish = false } = {}) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation checks
    if (!title.trim()) {
      setErrorMessage('Blog title is required.');
      return;
    }

    if (!slug.trim()) {
      setErrorMessage('URL slug is required.');
      return;
    }

    if (publish) {
      if (!contentHtml.trim() || contentHtml === '<p></p>' || contentHtml === '<br>') {
        setErrorMessage('Article content is required before publishing.');
        return;
      }
      if (coverImageUrl && !coverImageAlt.trim()) {
        setErrorMessage('Cover image alt text is required for publishing to ensure SEO accessibility.');
        return;
      }
    }

    try {
      setIsSaving(true);
      const result = await saveBlogPost(currentPostPayload, { publish, unpublish });
      if (result.success) {
        setStatus(result.post.status);
        const msg = publish 
          ? 'Article published live successfully!' 
          : unpublish 
            ? 'Article unpublished and reverted to Draft.' 
            : isEditing 
              ? 'Blog post updated successfully.' 
              : 'Draft post saved successfully.';
        setSuccessMessage(msg);
        setTimeout(() => {
          onSaveSuccess?.();
        }, 1200);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save blog post.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Action
  const handleDelete = async () => {
    if (!post?.id) return;
    try {
      setIsSaving(true);
      await deleteBlogPost(post.id);
      setIsDeleteDialogOpen(false);
      onSaveSuccess?.();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete blog post.');
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5dfd7]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-[#6b655e] hover:text-[#1a1814] hover:bg-[#ebe6e0] transition-colors cursor-pointer"
            aria-label="Back to all posts"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 
              className="text-2xl text-[#1a1814] font-normal tracking-wide"
              style={{ fontFamily: 'var(--font-family-editorial)' }}
            >
              {isEditing ? 'Edit Editorial Article' : 'Compose New Article'}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 font-semibold ${
                status === 'published' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {status === 'published' ? 'Published' : 'Draft'}
              </span>
              <span className="text-xs text-[#8c867f]">
                {post?.updated_at ? `Last saved: ${new Date(post.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Unsaved new draft'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isEditing && (
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
              title="Delete this article permanently"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs uppercase tracking-wider font-medium text-[#1a1814] bg-white border border-[#d8d2ca] hover:bg-[#f0ebe3] transition-colors cursor-pointer"
          >
            <Eye size={14} />
            <span>Preview</span>
          </button>

          {status === 'published' ? (
            <>
              <button
                type="button"
                onClick={() => handleSave({ unpublish: true })}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs uppercase tracking-wider font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span>Unpublish</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs uppercase tracking-wider font-semibold text-white bg-[#1a1814] hover:bg-[#c5a880] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Update Post</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleSave({ publish: false })}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider font-medium text-[#1a1814] bg-white border border-[#d8d2ca] hover:bg-[#f0ebe3] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave({ publish: true })}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs uppercase tracking-wider font-semibold text-white bg-emerald-800 hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
                <span>Publish</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700 text-sm">×</button>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check size={15} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800 text-sm">×</button>
        </div>
      )}

      {/* Main Grid: Content Editor (Left) & Sidebar Metadata (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 cols): Title, Excerpt, Rich Text Editor */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Article Title */}
          <div className="bg-white p-5 border border-[#e5dfd7] space-y-3 shadow-xs">
            <label className="block text-xs uppercase tracking-wider font-bold text-[#1a1814]">
              Article Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to Style a Pure Lawn Suit for Spring & Summer"
              className="w-full text-lg sm:text-xl font-medium px-3.5 py-2.5 border border-[#d8d2ca] text-[#1a1814] focus:outline-none focus:border-[#c5a880] transition-colors"
              style={{ fontFamily: 'var(--font-family-editorial)' }}
            />

            {/* Editable Slug */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-[#6b655e]">
              <span className="font-semibold text-[#8c867f] whitespace-nowrap">Permalink URL:</span>
              <div className="flex-1 flex items-center border border-[#e5dfd7] bg-[#faf8f6] px-2.5 py-1">
                <span className="text-[#8c867f] font-mono text-[11px] select-none">/blog/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setIsSlugManuallyEdited(true);
                    setSlug(generateSlug(e.target.value));
                  }}
                  placeholder="article-slug"
                  className="flex-1 bg-transparent font-mono text-[11px] text-[#1a1814] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Short Excerpt */}
          <div className="bg-white p-5 border border-[#e5dfd7] space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider font-bold text-[#1a1814]">
                Short Excerpt
              </label>
              <span className="text-[11px] text-[#8c867f]">
                {excerpt.length} characters (Recommended: 120-160)
              </span>
            </div>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief editorial summary shown in blog post cards and social shares..."
              className="w-full p-3 border border-[#d8d2ca] text-xs leading-relaxed text-[#1a1814] focus:outline-none focus:border-[#c5a880]"
            />
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white p-5 border border-[#e5dfd7] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider font-bold text-[#1a1814] flex items-center gap-1.5">
                <FileText size={14} className="text-[#c5a880]" />
                Article Content <span className="text-red-600">*</span>
              </label>
              <span className="text-[11px] text-[#8c867f]">
                Semantic HTML • XSS Protected
              </span>
            </div>

            <RichTextEditor
              value={contentHtml}
              onChange={(newHtml) => setContentHtml(newHtml)}
              placeholder="Begin writing your couture fashion story..."
            />
          </div>

          {/* SEO & Meta Tags Section */}
          <div className="bg-white p-5 border border-[#e5dfd7] space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#f0eae2] pb-3">
              <h3 className="text-xs uppercase tracking-[0.18em] font-bold text-[#1a1814] flex items-center gap-2">
                <Sparkles size={14} className="text-[#c5a880]" />
                Search Engine Optimization (SEO) & Social Sharing
              </h3>
              <span className="text-[10px] uppercase tracking-wider bg-[#faf8f6] px-2 py-0.5 text-[#8c867f] border border-[#e5dfd7]">
                Live Google / Social Preview
              </span>
            </div>

            {/* SERP Search Snippet Preview */}
            <div className="p-3.5 bg-[#faf8f6] border border-[#e5dfd7] space-y-1">
              <div className="text-[11px] text-[#1a0dab] font-mono truncate">
                https://yasraftextiles.com/blog/{slug || 'post-slug'}
              </div>
              <div className="text-sm font-medium text-[#1a0dab] hover:underline cursor-pointer truncate">
                {seoTitle || title || 'Post Title'}
              </div>
              <div className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
                {seoDescription || excerpt || 'Article description will display here in Google search results...'}
              </div>
            </div>

            {/* SEO Title with Character Counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs uppercase tracking-wider text-[#6b655e]">
                  SEO Title
                </label>
                <span className={`text-[11px] font-mono ${
                  seoTitle.length > 60 ? 'text-amber-600 font-bold' : 'text-[#8c867f]'
                }`}>
                  {seoTitle.length} / 60 chars {seoTitle.length > 60 && '(Truncated by Google)'}
                </span>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Title optimized for search engines..."
                className="w-full px-3 py-2 border border-[#d8d2ca] text-xs text-[#1a1814] focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            {/* SEO Meta Description with Character Counter */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs uppercase tracking-wider text-[#6b655e]">
                  SEO Meta Description
                </label>
                <span className={`text-[11px] font-mono ${
                  seoDescription.length > 160 ? 'text-amber-600 font-bold' : 'text-[#8c867f]'
                }`}>
                  {seoDescription.length} / 160 chars {seoDescription.length > 160 && '(Truncated by Google)'}
                </span>
              </div>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Meta description for search engine snippets and social previews..."
                className="w-full p-2.5 border border-[#d8d2ca] text-xs text-[#1a1814] focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            {/* Focus Keyword & Canonical URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#6b655e] mb-1">
                  Focus Keyword
                </label>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="e.g. style a lawn suit"
                  className="w-full px-3 py-2 border border-[#d8d2ca] text-xs text-[#1a1814] focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#6b655e] mb-1">
                  Canonical URL
                </label>
                <input
                  type="text"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://yasraftextiles.com/blog/..."
                  className="w-full px-3 py-2 border border-[#d8d2ca] text-xs text-[#1a1814] focus:outline-none focus:border-[#c5a880]"
                />
              </div>
            </div>

            {/* Social Sharing Image */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#6b655e] mb-1">
                Social Sharing Image URL (Open Graph / Twitter Card)
              </label>
              <input
                type="text"
                value={socialImageUrl}
                onChange={(e) => setSocialImageUrl(e.target.value)}
                placeholder="Defaults to cover photography..."
                className="w-full px-3 py-2 border border-[#d8d2ca] text-xs text-[#1a1814] focus:outline-none focus:border-[#c5a880]"
              />
            </div>

          </div>

        </div>

        {/* Right Column (1 col): Cover Image, Author, Category, Tags, Reading Time */}
        <div className="space-y-6">
          
          {/* Cover Photography Card */}
          <div className="bg-white p-5 border border-[#e5dfd7] space-y-3.5 shadow-xs">
            <label className="block text-xs uppercase tracking-wider font-bold text-[#1a1814] flex items-center justify-between">
              <span>Cover Photography</span>
              {coverImageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setCoverImageUrl('');
                    setCoverImageAlt('');
                  }}
                  className="text-[11px] text-red-600 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              )}
            </label>

            {coverImageUrl ? (
              <div className="space-y-2">
                <div className="aspect-[16/9] w-full bg-[#faf8f6] border border-[#e5dfd7] overflow-hidden relative group">
                  <img
                    src={coverImageUrl}
                    alt={coverImageAlt || 'Cover image'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/products/yasraf-meerab-black-1.png';
                    }}
                  />
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#d8d2ca] hover:border-[#c5a880] bg-[#faf8f6] cursor-pointer transition-colors text-center">
                <Upload size={22} className={isUploadingCover ? 'animate-bounce text-[#c5a880]' : 'text-[#8c867f] mb-2'} />
                <span className="text-xs font-medium text-[#1a1814]">
                  {isUploadingCover ? 'Uploading to Supabase storage...' : 'Upload Cover Photography'}
                </span>
                <span className="text-[10px] text-[#8c867f] mt-1">
                  JPG, PNG, WebP up to 5MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  disabled={isUploadingCover}
                  className="hidden"
                />
              </label>
            )}

            {/* Direct Cover URL input */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6b655e] mb-1">
                Image URL / Asset Path
              </label>
              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="/products/... or https://..."
                className="w-full px-2.5 py-1.5 border border-[#d8d2ca] text-xs text-[#1a1814] focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            {/* Cover Alt Text (Required for Publishing) */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#6b655e] mb-1">
                Image Alt Text <span className="text-red-600">* (Required to publish)</span>
              </label>
              <input
                type="text"
                value={coverImageAlt}
                onChange={(e) => setCoverImageAlt(e.target.value)}
                placeholder="Descriptive text for accessibility and SEO..."
                className="w-full px-2.5 py-1.5 border border-[#d8d2ca] text-xs text-[#1a1814] focus:outline-none focus:border-[#c5a880]"
              />
            </div>
          </div>

          {/* Publishing Meta Details */}
          <div className="bg-white p-5 border border-[#e5dfd7] space-y-4 shadow-xs">
            <h3 className="text-xs uppercase tracking-wider font-bold text-[#1a1814] border-b border-[#f0eae2] pb-2">
              Editorial Classification
            </h3>

            {/* Category */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#6b655e] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-[#d8d2ca] text-xs text-[#1a1814] bg-white focus:outline-none focus:border-[#c5a880]"
              >
                {BLOG_CATEGORIES.filter(c => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#6b655e] mb-1">
                Author Byline
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="YASRAF Atelier Editorial"
                className="w-full px-3 py-2 border border-[#d8d2ca] text-xs text-[#1a1814] focus:outline-none focus:border-[#c5a880]"
              />
            </div>

            {/* Reading Time */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs uppercase tracking-wider text-[#6b655e]">
                  Reading Time (Minutes)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const calc = calculateReadingTime(contentHtml);
                    setReadingTime(calc);
                    setIsReadingTimeAuto(true);
                  }}
                  className="text-[10px] text-[#c5a880] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={10} /> Auto-calculate
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={readingTime}
                  onChange={(e) => {
                    setIsReadingTimeAuto(false);
                    setReadingTime(parseInt(e.target.value, 10) || 1);
                  }}
                  className="w-24 px-3 py-1.5 border border-[#d8d2ca] text-xs text-[#1a1814] focus:outline-none focus:border-[#c5a880]"
                />
                <span className="text-xs text-[#8c867f]">min read</span>
              </div>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#6b655e] mb-1">
                Tags & Topics
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type tag and press Enter or comma..."
                  className="w-full px-3 py-1.5 border border-[#d8d2ca] text-xs text-[#1a1814] focus:outline-none focus:border-[#c5a880]"
                />
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-1">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-[#faf8f6] border border-[#e5dfd7] text-[#4a4640]"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-[#8c867f] hover:text-red-600 cursor-pointer ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-[11px] text-[#8c867f] italic">No tags added yet</span>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full p-6 shadow-2xl border border-red-200 space-y-4">
            <h4 className="text-sm uppercase tracking-wider font-bold text-red-700 flex items-center gap-2">
              <AlertCircle size={16} /> Confirm Article Deletion
            </h4>
            <p className="text-xs text-[#4a4640] leading-relaxed">
              Are you sure you want to delete <strong>"{title}"</strong>? This will remove the article from the live storefront and cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 text-xs uppercase tracking-wider border border-[#d8d2ca] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-xs uppercase tracking-wider bg-red-700 text-white hover:bg-red-800 transition-colors cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      <BlogPostPreviewModal
        post={currentPostPayload}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />

    </div>
  );
}

