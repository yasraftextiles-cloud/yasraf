import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Clock, Calendar, User, Tag, Share2, 
  Check, Copy, ArrowRight, BookOpen, AlertCircle, RefreshCw 
} from 'lucide-react';
import { getBlogPostBySlug, getPublishedBlogPosts, getRelatedBlogPosts } from '../services/blogService';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { WhatsAppIcon, FacebookIcon } from '../components/SocialIcons';

export default function BlogPostPage({ 
  slug, 
  onNavigateHome, 
  onNavigateBlog, 
  onNavigatePost,
  onNotFound 
}) {
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadPostData() {
      setIsLoading(true);
      setNotFound(false);
      try {
        const found = await getBlogPostBySlug(slug, true);
        if (!found) {
          if (isMounted) {
            setNotFound(true);
            onNotFound?.();
          }
          return;
        }

        if (isMounted) {
          setPost(found);
          // Load related posts
          const all = await getPublishedBlogPosts();
          const related = getRelatedBlogPosts(all, found, 3);
          setRelatedPosts(related);
        }
      } catch (err) {
        console.warn('[BlogPostPage] Error fetching article:', err);
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (slug) {
      loadPostData();
    } else {
      setNotFound(true);
      setIsLoading(false);
    }

    return () => { isMounted = false; };
  }, [slug, onNotFound]);

  // Handle Share Actions
  const currentUrl = typeof window !== 'undefined' ? window.location.href : `https://yasraftextiles.com/blog/${slug}`;
  const shareTitle = post?.title || 'YASRAF Textiles Article';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`${shareTitle}\n${currentUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(currentUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer');
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(currentUrl);
    const text = encodeURIComponent(shareTitle);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f6] flex flex-col items-center justify-center text-[#8c867f] gap-3 pt-32">
        <RefreshCw size={24} className="animate-spin text-[#c5a880]" />
        <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#1a1814]">
          Opening Atelier Article...
        </span>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-[#faf8f6] flex flex-col items-center justify-center text-center px-4 pt-32 pb-20">
        <div className="max-w-md space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#f2ece4] mx-auto flex items-center justify-center text-[#8c867f]">
            <BookOpen size={24} />
          </div>
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#c5a880]">
            Article Not Found
          </span>
          <h1 
            className="text-3xl sm:text-4xl text-[#1a1814] font-normal tracking-wide"
            style={{ fontFamily: 'var(--font-family-editorial)' }}
          >
            404 — Story Unavailable
          </h1>
          <p className="text-xs sm:text-sm text-[#6b655e] leading-relaxed">
            The journal entry you requested does not exist, has been unpublished, or its permalink has been updated.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onNavigateBlog?.()}
              className="px-5 py-2.5 text-xs uppercase tracking-wider font-semibold bg-[#1a1814] text-white hover:bg-[#c5a880] transition-colors cursor-pointer"
            >
              Browse The Journal
            </button>
            <button
              onClick={() => onNavigateHome?.()}
              className="px-5 py-2.5 text-xs uppercase tracking-wider font-semibold border border-[#d8d2ca] text-[#1a1814] hover:bg-white transition-colors cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pubDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Draft';

  const sanitizedContent = sanitizeHtml(post.content_html || '');

  return (
    <article className="min-h-screen bg-[#faf8f6] text-[#1a1814] pt-28 sm:pt-36 pb-24 antialiased selection:bg-[#c5a880]/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#8c867f] uppercase tracking-[0.16em] mb-8 overflow-x-auto whitespace-nowrap">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); onNavigateHome?.(); }}
            className="hover:text-[#1a1814] transition-colors"
          >
            Home
          </a>
          <span>/</span>
          <a
            href="/blog"
            onClick={(e) => { e.preventDefault(); onNavigateBlog?.(); }}
            className="hover:text-[#1a1814] transition-colors"
          >
            Journal
          </a>
          <span>/</span>
          <span className="text-[#c5a880] font-semibold">{post.category || 'Article'}</span>
        </nav>

        {/* Back Link */}
        <button
          onClick={() => onNavigateBlog?.()}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] font-medium text-[#6b655e] hover:text-[#1a1814] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to All Articles</span>
        </button>

        {/* Article Header */}
        <header className="space-y-6 text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          
          {/* Category Tag */}
          <div>
            <span className="inline-block text-[11px] uppercase tracking-[0.24em] font-bold text-[#c5a880] border-b border-[#c5a880]/40 pb-1">
              {post.category || 'Styling Guide'}
            </span>
          </div>

          {/* Title */}
          <h1 
            className="text-3xl sm:text-4xl lg:text-5xl text-[#1a1814] font-normal tracking-wide leading-tight"
            style={{ fontFamily: 'var(--font-family-editorial)' }}
          >
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-base sm:text-lg text-[#6b655e] leading-relaxed italic max-w-2xl mx-auto font-serif">
              "{post.excerpt}"
            </p>
          )}

          {/* Byline & Metadata */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#8c867f] pt-4 border-t border-[#e5dfd7]">
            <div className="flex items-center gap-1.5 font-medium text-[#1a1814]">
              <User size={13} className="text-[#c5a880]" />
              <span>{post.author_name || 'YASRAF Atelier Editorial'}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar size={13} />
              <span>{pubDate}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock size={13} />
              <span>{post.reading_time || 3} min read</span>
            </div>
          </div>

        </header>

        {/* Hero Cover Photography */}
        {post.cover_image_url && (
          <figure className="mb-12 sm:mb-16">
            <div className="aspect-[16/9] w-full bg-[#f2ece4] border border-[#e5dfd7] overflow-hidden shadow-xs">
              <img
                src={post.cover_image_url}
                alt={post.cover_image_alt || post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/products/yasraf-meerab-black-1.png';
                }}
              />
            </div>
            {post.cover_image_alt && (
              <figcaption className="text-center text-xs text-[#8c867f] italic mt-3 max-w-xl mx-auto">
                {post.cover_image_alt}
              </figcaption>
            )}
          </figure>
        )}

        {/* Main Article Content (Rendered with luxury typography & sanitized) */}
        <div className="bg-white p-6 sm:p-12 lg:p-16 border border-[#e5dfd7] shadow-xs mb-12">
          <div 
            className="prose prose-stone max-w-none text-[#2a2622] leading-relaxed text-base sm:text-[17px] space-y-6"
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          {/* Tags */}
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-[#f0eae2] flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#8c867f] flex items-center gap-1 mr-2">
                <Tag size={12} /> Tags:
              </span>
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 text-xs bg-[#faf8f6] border border-[#e5dfd7] text-[#4a4640] uppercase tracking-wider font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Social Sharing Section */}
          <div className="mt-10 pt-6 border-t border-[#f0eae2] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] font-bold text-[#1a1814]">
              <Share2 size={15} className="text-[#c5a880]" />
              <span>Share this Story</span>
            </div>

            <div className="flex items-center gap-2">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={shareOnWhatsApp}
                className="p-2.5 bg-[#25D366] text-white hover:opacity-90 transition-opacity rounded-xs cursor-pointer"
                title="Share via WhatsApp"
                aria-label="Share via WhatsApp"
              >
                <WhatsAppIcon size={16} />
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={shareOnFacebook}
                className="p-2.5 bg-[#1877F2] text-white hover:opacity-90 transition-opacity rounded-xs cursor-pointer"
                title="Share on Facebook"
                aria-label="Share on Facebook"
              >
                <FacebookIcon size={16} />
              </button>

              {/* X / Twitter */}
              <button
                type="button"
                onClick={shareOnTwitter}
                className="px-3 py-2 bg-black text-white hover:bg-[#333] transition-colors rounded-xs text-xs font-bold cursor-pointer"
                title="Share on X"
                aria-label="Share on X"
              >
                𝕏
              </button>

              {/* Copy Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#d8d2ca] bg-[#faf8f6] text-[#1a1814] hover:bg-white transition-colors rounded-xs text-xs uppercase tracking-wider font-medium cursor-pointer"
                title="Copy Article Link"
              >
                {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{isCopied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#e5dfd7]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 
                  className="text-2xl text-[#1a1814] font-normal tracking-wide"
                  style={{ fontFamily: 'var(--font-family-editorial)' }}
                >
                  Related Stories
                </h2>
                <p className="text-xs text-[#8c867f] mt-0.5">
                  Further reading from the YASRAF couture archive
                </p>
              </div>

              <a
                href="/blog"
                onClick={(e) => { e.preventDefault(); onNavigateBlog?.(); }}
                className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-bold text-[#1a1814] hover:text-[#c5a880] transition-colors"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <article 
                  key={rel.id}
                  className="bg-white border border-[#e5dfd7] overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <a
                    href={`/blog/${rel.slug}`}
                    onClick={(e) => { e.preventDefault(); onNavigatePost?.(rel.slug); }}
                    className="aspect-[16/10] overflow-hidden bg-[#faf8f6] block relative"
                  >
                    <img
                      src={rel.cover_image_url || '/products/yasraf-meerab-black-1.png'}
                      alt={rel.cover_image_alt || rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      onError={(e) => {
                        e.currentTarget.src = '/products/yasraf-meerab-black-1.png';
                      }}
                    />
                    <span className="absolute top-2.5 left-2.5 bg-white/95 text-[9px] uppercase tracking-wider px-2 py-0.5 text-[#1a1814] font-semibold border border-black/10">
                      {rel.category}
                    </span>
                  </a>

                  <div className="p-4 space-y-2">
                    <h3 
                      className="text-sm font-medium text-[#1a1814] group-hover:text-[#c5a880] transition-colors line-clamp-2 leading-snug"
                    >
                      <a
                        href={`/blog/${rel.slug}`}
                        onClick={(e) => { e.preventDefault(); onNavigatePost?.(rel.slug); }}
                      >
                        {rel.title}
                      </a>
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-[#8c867f] pt-2 border-t border-[#f0eae2]">
                      <Clock size={11} />
                      <span>{rel.reading_time || 3} min read</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

      </div>
    </article>
  );
}

