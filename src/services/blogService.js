// ==========================================================================
// YASRAF TEXTILES — BLOG CMS SERVICE
// Secure Supabase Integration with Resilient Offline Fallback & Validation
// ==========================================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { INITIAL_BLOG_POSTS } from '../data/initialBlogPosts.js';
import { calculateReadingTime } from '../utils/sanitizeHtml.js';

const LOCAL_STORAGE_KEY = 'yasraf_blog_posts';

// In-memory fallback for Node/SSR environments
let memoryCache = null;

/**
 * Helper to get local cache (supporting browser localStorage and Node/SSR memory cache)
 */
function getLocalBlogPosts() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[blogService] Failed to parse local blog cache:', err);
    }
  }

  if (memoryCache && Array.isArray(memoryCache)) {
    return memoryCache;
  }

  return [...INITIAL_BLOG_POSTS];
}

/**
 * Helper to update local cache
 */
function setLocalBlogPosts(posts) {
  memoryCache = posts;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
    } catch (err) {
      console.warn('[blogService] Failed to persist blog cache to localStorage:', err);
    }
  }
}

/**
 * Generate a clean URL-friendly slug
 */
export function generateSlug(title = '') {
  return String(title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Fetch all published blog posts for public storefront
 */
export async function getPublishedBlogPosts() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        // Sync local cache
        if (data.length > 0) {
          const currentLocal = getLocalBlogPosts();
          const merged = [...data];
          // Keep drafts in local cache for admin resilience
          currentLocal.filter(p => p.status !== 'published').forEach(draft => {
            if (!merged.some(m => m.id === draft.id)) {
              merged.push(draft);
            }
          });
          setLocalBlogPosts(merged);
        }
        return data;
      }
    } catch (err) {
      console.warn('[blogService] Supabase fetch error, using local fallback:', err);
    }
  }

  // Fallback to local storage
  const local = getLocalBlogPosts();
  return local
    .filter((p) => p.status === 'published')
    .sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));
}

/**
 * Fetch a single blog post by slug
 */
export async function getBlogPostBySlug(slug, allowDraft = false) {
  if (!slug) return null;
  const cleanSlug = String(slug).toLowerCase().trim();

  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', cleanSlug);

      if (!allowDraft) {
        query = query.eq('status', 'published');
      }

      const { data, error } = await query.maybeSingle();
      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('[blogService] Fetch by slug error:', err);
    }
  }

  // Local fallback
  const local = getLocalBlogPosts();
  const found = local.find((p) => p.slug?.toLowerCase().trim() === cleanSlug);
  if (found) {
    if (allowDraft || found.status === 'published') {
      return found;
    }
  }

  return null;
}

/**
 * Fetch all blog posts for the Admin Dashboard (Drafts and Published)
 */
export async function getAdminBlogPosts() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        setLocalBlogPosts(data);
        return data;
      }
    } catch (err) {
      console.warn('[blogService] Admin fetch error, using local fallback:', err);
    }
  }

  const local = getLocalBlogPosts();
  return local.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
}

/**
 * Save or publish a blog post
 */
export async function saveBlogPost(postData, { publish = false, unpublish = false } = {}) {
  // 1. Core validations
  const title = String(postData.title || '').trim();
  if (!title) {
    throw new Error('Blog title is required.');
  }

  let slug = String(postData.slug || '').trim();
  if (!slug) {
    slug = generateSlug(title);
  } else {
    slug = generateSlug(slug);
  }

  if (!slug) {
    throw new Error('Valid URL slug is required.');
  }

  const contentHtml = String(postData.content_html || '').trim();
  const coverImageAlt = String(postData.cover_image_alt || '').trim();

  // Validate publishing requirements
  if (publish) {
    if (!contentHtml || contentHtml === '<p></p>' || contentHtml === '<br>') {
      throw new Error('Article content is required before publishing.');
    }
    if (!coverImageAlt && postData.cover_image_url) {
      throw new Error('Cover image alt text is required for publishing to ensure SEO accessibility.');
    }
  }

  const readingTime = postData.reading_time || calculateReadingTime(contentHtml);
  const now = new Date().toISOString();

  // Determine status:
  // Strict rule: "Do not save the post as published while the admin is still writing.
  // It must remain Draft until the admin explicitly clicks Publish."
  let targetStatus = 'draft';
  let publishedAt = postData.published_at || null;

  if (publish) {
    targetStatus = 'published';
    publishedAt = postData.published_at || now;
  } else if (unpublish) {
    targetStatus = 'draft';
    publishedAt = null;
  } else if (postData.id && postData.status === 'published') {
    // If updating an already published post without explicit unpublish
    targetStatus = 'published';
    publishedAt = postData.published_at || now;
  } else {
    targetStatus = 'draft';
  }

  const id = postData.id || crypto.randomUUID();

  // Clean tags array
  let tags = [];
  if (Array.isArray(postData.tags)) {
    tags = postData.tags.map((t) => String(t).trim()).filter(Boolean);
  } else if (typeof postData.tags === 'string') {
    tags = postData.tags.split(',').map((t) => t.trim()).filter(Boolean);
  }

  const payload = {
    id,
    title,
    slug,
    excerpt: String(postData.excerpt || '').trim(),
    content_html: contentHtml,
    cover_image_url: postData.cover_image_url || null,
    cover_image_alt: coverImageAlt || null,
    author_id: postData.author_id || null,
    author_name: String(postData.author_name || 'YASRAF Atelier Editorial').trim(),
    category: String(postData.category || 'Styling Guide').trim(),
    tags,
    reading_time: Number(readingTime) || 3,
    status: targetStatus,
    seo_title: String(postData.seo_title || '').trim() || `${title} | YASRAF Textiles`,
    seo_description: String(postData.seo_description || '').trim() || String(postData.excerpt || '').slice(0, 155),
    focus_keyword: String(postData.focus_keyword || '').trim(),
    canonical_url: String(postData.canonical_url || '').trim() || `https://yasraftextiles.com/blog/${slug}`,
    social_image_url: postData.social_image_url || postData.cover_image_url || null,
    published_at: publishedAt,
    updated_at: now
  };

  // Check slug uniqueness in local posts
  const localPosts = getLocalBlogPosts();
  const duplicate = localPosts.find((p) => p.slug === slug && p.id !== id);
  if (duplicate) {
    throw new Error(`The slug "${slug}" is already in use by post "${duplicate.title}". Please choose a unique slug.`);
  }

  // Attempt Supabase upsert
  let savedToRemote = false;
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .upsert({
          ...payload,
          created_at: postData.created_at || now
        })
        .select()
        .single();

      if (!error && data) {
        payload.created_at = data.created_at;
        payload.updated_at = data.updated_at;
        savedToRemote = true;
      } else if (error) {
        console.warn('[blogService] Remote upsert failed:', error.message);
        if (error.code === '23505') {
          throw new Error(`The slug "${slug}" is already taken in the database.`);
        }
      }
    } catch (err) {
      if (err.message && err.message.includes('slug')) {
        throw err;
      }
      console.warn('[blogService] Exception during remote save:', err);
    }
  }

  // Always update local cache
  const existingIndex = localPosts.findIndex((p) => p.id === id);
  if (existingIndex >= 0) {
    localPosts[existingIndex] = { ...localPosts[existingIndex], ...payload };
  } else {
    localPosts.unshift({ ...payload, created_at: postData.created_at || now });
  }
  setLocalBlogPosts(localPosts);

  return {
    success: true,
    post: payload,
    savedToRemote
  };
}

/**
 * Unpublish a blog post
 */
export async function unpublishBlogPost(id) {
  if (!id) throw new Error('Post ID is required');

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ status: 'draft', updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) console.warn('[blogService] Remote unpublish notice:', error.message);
    } catch (err) {
      console.warn('[blogService] Remote unpublish exception:', err);
    }
  }

  const local = getLocalBlogPosts();
  const updated = local.map((p) => {
    if (p.id === id) {
      return { ...p, status: 'draft', updated_at: new Date().toISOString() };
    }
    return p;
  });
  setLocalBlogPosts(updated);
  return true;
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(id) {
  if (!id) throw new Error('Post ID is required');

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      if (error) console.warn('[blogService] Remote delete notice:', error.message);
    } catch (err) {
      console.warn('[blogService] Remote delete exception:', err);
    }
  }

  const local = getLocalBlogPosts();
  const filtered = local.filter((p) => p.id !== id);
  setLocalBlogPosts(filtered);
  return true;
}

/**
 * Upload an image to the 'blog-images' storage bucket with validation
 */
export async function uploadBlogImage(file) {
  if (!file) throw new Error('No file provided');

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type (${file.type}). Allowed formats: JPG, PNG, WebP, GIF.`);
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_SIZE) {
    throw new Error(`Image size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 5MB limit.`);
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 40);
  const filePath = `editorial/${Date.now()}_${cleanName}.${ext}`;

  if (isSupabaseConfigured) {
    try {
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('blog-images')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else {
        console.warn('[blogService] blog-images bucket upload failed, attempting product-images bucket fallback:', uploadError.message);
        // Fallback to product-images bucket if blog-images bucket hasn't been created yet
        const { error: fallbackError } = await supabase.storage
          .from('product-images')
          .upload(`blog/${Date.now()}_${cleanName}.${ext}`, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (!fallbackError) {
          const { data: fallbackUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(`blog/${Date.now()}_${cleanName}.${ext}`);

          if (fallbackUrlData?.publicUrl) {
            return fallbackUrlData.publicUrl;
          }
        }
      }
    } catch (err) {
      console.warn('[blogService] Storage upload exception:', err);
    }
  }

  // Local Data URL fallback for immediate preview/persistence
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get related blog posts
 */
export function getRelatedBlogPosts(allPosts = [], currentPost, limit = 3) {
  if (!currentPost || !Array.isArray(allPosts)) return [];
  return allPosts
    .filter((p) => p.id !== currentPost.id && p.status === 'published')
    .filter((p) => {
      if (p.category === currentPost.category) return true;
      if (Array.isArray(p.tags) && Array.isArray(currentPost.tags)) {
        return p.tags.some((t) => currentPost.tags.includes(t));
      }
      return true;
    })
    .slice(0, limit);
}
