import React from 'react';
import { X, Clock, Calendar, User, Tag, Share2, Eye, AlertCircle } from 'lucide-react';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

export default function BlogPostPreviewModal({ post, isOpen, onClose }) {
  if (!isOpen || !post) return null;

  const sanitizedContent = sanitizeHtml(post.content_html || '');
  const publishedDate = post.published_at 
    ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Draft (Not Yet Published)';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#faf8f6] w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-[#c5a880]/40 overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="bg-[#141311] text-white px-6 py-4 flex items-center justify-between border-b border-[#262320] shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] font-semibold text-[#c5a880]">
              <Eye size={14} /> Editorial Preview
            </span>
            <span className="text-[#8c867f]">•</span>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 font-medium ${
              post.status === 'published' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {post.status === 'published' ? 'Live Published' : 'Draft Preview'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-[#8c867f] hover:text-white p-1 transition-colors cursor-pointer"
            aria-label="Close preview"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="bg-[#f2ece4] border-b border-[#e5dfd7] px-6 py-2.5 flex items-center justify-between text-xs text-[#6b655e]">
          <span>Previewing article with storefront editorial styling and XSS sanitization applied.</span>
          <span className="font-mono text-[11px] text-[#1a1814]">/blog/{post.slug || 'slug'}</span>
        </div>

        {/* Scrollable Article Canvas */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 lg:p-14 bg-white">
          <article className="max-w-2xl mx-auto">
            
            {/* Meta Header */}
            <div className="text-center space-y-4 mb-8">
              <span className="inline-block text-[11px] uppercase tracking-[0.24em] font-bold text-[#c5a880] border-b border-[#c5a880]/40 pb-1">
                {post.category || 'Styling Guide'}
              </span>

              <h1 
                className="text-3xl sm:text-4xl text-[#1a1814] font-normal leading-tight tracking-wide"
                style={{ fontFamily: 'var(--font-family-editorial)' }}
              >
                {post.title || 'Untitled Blog Post'}
              </h1>

              {post.excerpt && (
                <p className="text-base text-[#6b655e] leading-relaxed italic max-w-xl mx-auto">
                  "{post.excerpt}"
                </p>
              )}

              {/* Byline */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#8c867f] pt-2 border-t border-[#f0eae2]">
                <span className="flex items-center gap-1.5 font-medium text-[#1a1814]">
                  <User size={13} className="text-[#c5a880]" />
                  {post.author_name || 'YASRAF Atelier Editorial'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  {publishedDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} />
                  {post.reading_time || 3} min read
                </span>
              </div>
            </div>

            {/* Cover Image */}
            {post.cover_image_url ? (
              <figure className="mb-10">
                <div className="aspect-[16/9] w-full bg-[#faf8f6] border border-[#e5dfd7] overflow-hidden">
                  <img
                    src={post.cover_image_url}
                    alt={post.cover_image_alt || post.title || 'Article cover image'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/products/yasraf-meerab-black-1.png';
                    }}
                  />
                </div>
                {post.cover_image_alt && (
                  <figcaption className="text-center text-xs text-[#8c867f] italic mt-2.5">
                    {post.cover_image_alt}
                  </figcaption>
                )}
              </figure>
            ) : (
              <div className="p-8 mb-8 bg-[#faf8f6] border border-dashed border-[#d8d2ca] text-center text-xs text-[#8c867f]">
                No cover photography attached.
              </div>
            )}

            {/* Sanitized Body Content */}
            <div 
              className="prose prose-stone max-w-none text-[#2a2622] leading-relaxed text-base space-y-5"
              dangerouslySetInnerHTML={{ __html: sanitizedContent || '<p className="italic text-[#8c867f]">No content written yet.</p>' }}
            />

            {/* Tags */}
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="mt-12 pt-6 border-t border-[#f0eae2] flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#8c867f] flex items-center gap-1 mr-2">
                  <Tag size={12} /> Tags:
                </span>
                {post.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs bg-[#faf8f6] border border-[#e5dfd7] text-[#4a4640] uppercase tracking-wider"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

          </article>
        </div>

        {/* Modal Bottom Bar */}
        <div className="bg-[#faf8f6] px-6 py-3 border-t border-[#ebe6e0] flex items-center justify-between shrink-0">
          <div className="text-xs text-[#8c867f]">
            Status: <strong className="text-[#1a1814] uppercase">{post.status || 'Draft'}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs uppercase tracking-wider font-semibold bg-[#1a1814] text-white hover:bg-[#c5a880] transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
}

