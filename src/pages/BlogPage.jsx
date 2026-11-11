import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Clock, Calendar, ArrowRight, User, Sparkles, 
  ChevronLeft, ChevronRight, Tag, BookOpen, AlertCircle, RefreshCw 
} from 'lucide-react';
import { getPublishedBlogPosts } from '../services/blogService';
import { BLOG_CATEGORIES } from '../data/initialBlogPosts';

const POSTS_PER_PAGE = 6;

export default function BlogPage({ onNavigatePost, onNavigateHome }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Load published blog posts
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await getPublishedBlogPosts();
        if (isMounted) {
          setPosts(data || []);
        }
      } catch (err) {
        console.warn('[BlogPage] Load exception:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Category filter
      if (selectedCategory !== 'All' && post.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = post.title?.toLowerCase().includes(q);
        const excerptMatch = post.excerpt?.toLowerCase().includes(q);
        const tagMatch = Array.isArray(post.tags) && post.tags.some(t => t.toLowerCase().includes(q));
        return titleMatch || excerptMatch || tagMatch;
      }
      return true;
    });
  }, [posts, selectedCategory, searchQuery]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Featured post is the very first post (if on page 1 and no search query)
  const isSearchOrFiltered = selectedCategory !== 'All' || searchQuery.trim().length > 0;
  const featuredPost = !isSearchOrFiltered && currentPage === 1 && filteredPosts.length > 0 
    ? filteredPosts[0] 
    : null;

  // Remaining posts for grid
  const remainingPosts = useMemo(() => {
    if (featuredPost) {
      return filteredPosts.slice(1);
    }
    return filteredPosts;
  }, [filteredPosts, featuredPost]);

  // Pagination calculation
  const totalPages = Math.ceil(remainingPosts.length / POSTS_PER_PAGE) || 1;
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    return remainingPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [remainingPosts, currentPage]);

  const handlePostClick = (e, slug) => {
    e.preventDefault();
    onNavigatePost?.(slug);
  };

  return (
    <div className="min-h-screen bg-[#faf8f6] text-[#1a1814] pt-28 sm:pt-36 pb-24 antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#8c867f] uppercase tracking-[0.16em] mb-8">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); onNavigateHome?.(); }}
            className="hover:text-[#1a1814] transition-colors"
          >
            Home
          </a>
          <span>/</span>
          <span className="text-[#1a1814] font-semibold">The Atelier Journal</span>
        </nav>

        {/* Hero Editorial Header */}
        <header className="text-center max-w-3xl mx-auto mb-14 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.24em] text-[#c5a880] font-bold">
            <Sparkles size={13} /> Stories & Craftsmanship
          </div>

          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl text-[#1a1814] font-normal tracking-wide leading-tight"
            style={{ fontFamily: 'var(--font-family-editorial)' }}
          >
            The Atelier Journal
          </h1>

          <p className="text-sm sm:text-base text-[#6b655e] leading-relaxed max-w-2xl mx-auto">
            Explore styling essays, textile preservation guides, and the centuries-old artisanal needlework that defines YASRAF haute couture.
          </p>
        </header>

        {/* Filter Bar & Search */}
        <div className="mb-12 space-y-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#e5dfd7] pb-6">
            
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {BLOG_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 text-xs uppercase tracking-[0.12em] font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[#1a1814] text-white shadow-xs'
                        : 'bg-white text-[#6b655e] hover:text-[#1a1814] border border-[#e5dfd7] hover:border-[#c5a880]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c867f]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles & guides..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#d8d2ca] text-[#1a1814] placeholder-[#8c867f] focus:outline-none focus:border-[#c5a880] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8c867f] hover:text-[#1a1814]"
                >
                  ×
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-[#8c867f] gap-3">
            <RefreshCw size={24} className="animate-spin text-[#c5a880]" />
            <span className="text-xs uppercase tracking-[0.2em] font-medium">
              Curating Atelier Articles...
            </span>
          </div>
        ) : filteredPosts.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#f2ece4] mx-auto flex items-center justify-center text-[#8c867f]">
              <BookOpen size={24} />
            </div>
            <h3 className="text-lg font-normal text-[#1a1814] tracking-wide" style={{ fontFamily: 'var(--font-family-editorial)' }}>
              No Articles Found
            </h3>
            <p className="text-xs text-[#6b655e] leading-relaxed">
              We couldn't find any articles matching your search criteria. Try choosing a different category or clearing the search keyword.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 text-xs uppercase tracking-wider font-semibold bg-[#1a1814] text-white hover:bg-[#c5a880] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* Featured Post Card (Hero) */}
            {featuredPost && (
              <article className="bg-white border border-[#e5dfd7] overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  
                  {/* Featured Cover Image */}
                  <div className="lg:col-span-7 aspect-[16/10] lg:aspect-auto overflow-hidden relative bg-[#faf8f6]">
                    <a
                      href={`/blog/${featuredPost.slug}`}
                      onClick={(e) => handlePostClick(e, featuredPost.slug)}
                      className="block w-full h-full"
                    >
                      <img
                        src={featuredPost.cover_image_url || '/products/yasraf-meerab-black-1.png'}
                        alt={featuredPost.cover_image_alt || featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        onError={(e) => {
                          e.currentTarget.src = '/products/yasraf-meerab-black-1.png';
                        }}
                      />
                    </a>
                  </div>

                  {/* Featured Content Details */}
                  <div className="lg:col-span-5 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#c5a880] bg-[#faf8f6] px-2.5 py-1 border border-[#e5dfd7]">
                          Featured Story
                        </span>
                        <span className="text-[11px] uppercase tracking-wider text-[#8c867f] font-medium">
                          {featuredPost.category}
                        </span>
                      </div>

                      <h2 
                        className="text-2xl sm:text-3xl text-[#1a1814] font-normal tracking-wide leading-snug group-hover:text-[#c5a880] transition-colors"
                        style={{ fontFamily: 'var(--font-family-editorial)' }}
                      >
                        <a 
                          href={`/blog/${featuredPost.slug}`}
                          onClick={(e) => handlePostClick(e, featuredPost.slug)}
                        >
                          {featuredPost.title}
                        </a>
                      </h2>

                      {featuredPost.excerpt && (
                        <p className="text-xs sm:text-sm text-[#6b655e] leading-relaxed line-clamp-3">
                          {featuredPost.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-6 border-t border-[#f0eae2] mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-[#8c867f]">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          {featuredPost.published_at 
                            ? new Date(featuredPost.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'Recent'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          {featuredPost.reading_time || 3} min read
                        </span>
                      </div>

                      <a
                        href={`/blog/${featuredPost.slug}`}
                        onClick={(e) => handlePostClick(e, featuredPost.slug)}
                        className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-bold text-[#1a1814] group-hover:text-[#c5a880] transition-colors"
                      >
                        <span>Read</span>
                        <ArrowRight size={13} />
                      </a>
                    </div>

                  </div>

                </div>
              </article>
            )}

            {/* Grid of Regular Posts */}
            {paginatedPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedPosts.map((post) => {
                  const pubDate = post.published_at
                    ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Recent';

                  return (
                    <article 
                      key={post.id}
                      className="bg-white border border-[#e5dfd7] overflow-hidden flex flex-col group hover:shadow-md transition-all duration-300"
                    >
                      {/* Card Cover Image */}
                      <a
                        href={`/blog/${post.slug}`}
                        onClick={(e) => handlePostClick(e, post.slug)}
                        className="aspect-[16/10] overflow-hidden bg-[#faf8f6] block relative"
                      >
                        <img
                          src={post.cover_image_url || '/products/yasraf-meerab-black-1.png'}
                          alt={post.cover_image_alt || post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          onError={(e) => {
                            e.currentTarget.src = '/products/yasraf-meerab-black-1.png';
                          }}
                        />
                        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[10px] uppercase tracking-[0.16em] px-2.5 py-0.5 text-[#1a1814] font-semibold border border-black/10">
                          {post.category || 'Guide'}
                        </span>
                      </a>

                      {/* Card Body */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2.5">
                          <h3 
                            className="text-lg sm:text-xl text-[#1a1814] font-normal leading-snug tracking-wide group-hover:text-[#c5a880] transition-colors"
                            style={{ fontFamily: 'var(--font-family-editorial)' }}
                          >
                            <a 
                              href={`/blog/${post.slug}`}
                              onClick={(e) => handlePostClick(e, post.slug)}
                            >
                              {post.title}
                            </a>
                          </h3>

                          {post.excerpt && (
                            <p className="text-xs text-[#6b655e] leading-relaxed line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                        </div>

                        {/* Card Meta & Read Link */}
                        <div className="pt-4 border-t border-[#f0eae2] flex items-center justify-between text-xs text-[#8c867f]">
                          <div className="flex items-center gap-2">
                            <span>{pubDate}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {post.reading_time || 3} min
                            </span>
                          </div>

                          <a
                            href={`/blog/${post.slug}`}
                            onClick={(e) => handlePostClick(e, post.slug)}
                            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-[#1a1814] group-hover:text-[#c5a880] transition-colors"
                          >
                            <span>Read</span>
                            <ArrowRight size={12} />
                          </a>
                        </div>
                      </div>

                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8 border-t border-[#e5dfd7]">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-[#d8d2ca] bg-white text-[#1a1814] hover:bg-[#ebe6e0] transition-colors disabled:opacity-40 cursor-pointer"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                        isActive
                          ? 'bg-[#1a1814] text-white border-[#1a1814]'
                          : 'bg-white text-[#4a4640] border-[#d8d2ca] hover:bg-[#ebe6e0]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-[#d8d2ca] bg-white text-[#1a1814] hover:bg-[#ebe6e0] transition-colors disabled:opacity-40 cursor-pointer"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

