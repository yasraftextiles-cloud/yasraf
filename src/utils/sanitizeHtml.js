// ==========================================================================
// YASRAF TEXTILES — PRODUCTION HTML SANITIZER & XSS PREVENTION
// Prevents Cross-Site Scripting (XSS) while preserving rich editorial styling
// ==========================================================================

const ALLOWED_TAGS = new Set([
  'h2', 'h3', 'h4', 'p', 'span', 'b', 'strong', 'i', 'em', 'u', 's',
  'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'figure', 'figcaption',
  'br', 'hr', 'code', 'pre'
]);

const ALLOWED_ATTRS = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'title', 'width', 'height', 'loading']),
  blockquote: new Set(['cite']),
  p: new Set(['class']),
  span: new Set(['class']),
  h2: new Set(['id', 'class']),
  h3: new Set(['id', 'class']),
  h4: new Set(['id', 'class']),
  figure: new Set(['class']),
  figcaption: new Set(['class'])
};

const DANGEROUS_PROTOCOLS = /^(javascript|vbscript|data(?!:image\/(png|jpe?g|webp|gif))):/i;

/**
 * Escapes plain text for safe rendering
 */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Calculates estimated reading time from HTML or text in minutes
 */
export function calculateReadingTime(htmlOrText = '') {
  if (!htmlOrText) return 1;
  const cleanText = String(htmlOrText)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Sanitizes rich text HTML for secure rendering
 */
export function sanitizeHtml(rawHtml = '') {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  // Server-side / Node fallback
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '');
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');

    // Remove explicitly banned dangerous elements including their contents
    const dangerousElements = doc.querySelectorAll('script, style, iframe, object, embed, form, input, button, select, textarea, svg, math, noscript');
    dangerousElements.forEach((el) => el.remove());

    function sanitizeNode(node) {
      // Process child nodes from end to start to allow safe mutations
      const children = Array.from(node.childNodes);
      for (const child of children) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const tagName = child.tagName.toLowerCase();

          if (!ALLOWED_TAGS.has(tagName)) {
            // Replace non-allowed tags with text or unwrap allowed children
            const textNode = doc.createTextNode(child.textContent || '');
            node.replaceChild(textNode, child);
            continue;
          }

          // Clean attributes
          const allowedForTag = ALLOWED_ATTRS[tagName] || new Set();
          const attributes = Array.from(child.attributes);

          for (const attr of attributes) {
            const attrName = attr.name.toLowerCase();

            // Strip any on* event handlers
            if (attrName.startsWith('on')) {
              child.removeAttribute(attr.name);
              continue;
            }

            // Check against allowed attributes
            if (!allowedForTag.has(attrName)) {
              child.removeAttribute(attr.name);
              continue;
            }

            // Check protocols for links and images
            if (attrName === 'href' || attrName === 'src') {
              const val = (attr.value || '').trim();
              if (DANGEROUS_PROTOCOLS.test(val)) {
                child.removeAttribute(attr.name);
                continue;
              }
            }
          }

          // Force secure attributes for links
          if (tagName === 'a') {
            child.setAttribute('rel', 'noopener noreferrer');
            const href = child.getAttribute('href') || '';
            if (href.startsWith('http://') || href.startsWith('https://')) {
              child.setAttribute('target', '_blank');
            }
          }

          // Force lazy loading and graceful styling for images
          if (tagName === 'img') {
            child.setAttribute('loading', 'lazy');
            const currentClass = child.getAttribute('class') || '';
            if (!currentClass.includes('editorial-content-img')) {
              child.setAttribute('class', `${currentClass} editorial-content-img max-w-full h-auto rounded-none my-6`.trim());
            }
          }

          // Recurse into children
          sanitizeNode(child);
        }
      }
    }

    sanitizeNode(doc.body);
    return doc.body.innerHTML;
  } catch (err) {
    console.warn('[sanitizeHtml] Error parsing HTML:', err);
    return escapeHtml(rawHtml);
  }
}

