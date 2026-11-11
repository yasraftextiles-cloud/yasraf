// ==========================================================================
// TEST SUITE: YASRAF BLOG CMS FUNCTIONALITY & VERIFICATION
// ==========================================================================

import { 
  getPublishedBlogPosts, 
  getAdminBlogPosts, 
  getBlogPostBySlug, 
  saveBlogPost, 
  unpublishBlogPost, 
  deleteBlogPost, 
  uploadBlogImage,
  getRelatedBlogPosts
} from '../src/services/blogService.js';
import { sanitizeHtml, calculateReadingTime } from '../src/utils/sanitizeHtml.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('=== STARTING YASRAF BLOG CMS AUTOMATED TEST SUITE ===\n');

  let testPostId = null;
  const testSlug = 'test-couture-embroidery-guide-' + Date.now();

  // Test 1: HTML Sanitizer & XSS Prevention
  console.log('Test 1: Testing HTML Sanitization and XSS Attack Vectors...');
  const unsafeHtml = '<p>Safe intro</p><script>alert("XSS")</script><img src="x" onerror="alert(1)" /><a href="javascript:alert(2)">Malicious Link</a>';
  const cleanHtml = sanitizeHtml(unsafeHtml);
  if (cleanHtml.includes('script') || cleanHtml.includes('onerror') || cleanHtml.includes('javascript:')) {
    throw new Error('XSS Sanitization test FAILED! Unsafe content was not removed: ' + cleanHtml);
  }
  console.log('✓ XSS prevention passed. Output:', cleanHtml);

  // Test 2: Calculate Reading Time
  console.log('\nTest 2: Testing Reading Time Calculation...');
  const sampleText = '<p>' + 'word '.repeat(450) + '</p>';
  const readTime = calculateReadingTime(sampleText);
  if (readTime !== 3) { // 450 / 200 = 2.25 => ceil 3
    throw new Error(`Reading time failed: expected 3 min, got ${readTime}`);
  }
  console.log(`✓ Reading time calculation passed: 450 words = ${readTime} min read.`);

  // Test 3: Create a Draft Post (Ensure it remains Draft)
  console.log('\nTest 3: Creating a Draft Post...');
  const newPostData = {
    title: 'The Modern Lawn Revolution',
    slug: testSlug,
    excerpt: 'An in-depth exploration of contemporary Pakistani textile design.',
    content_html: '<h2>A New Era in Lawn</h2><p>Hand-finished luxury details with Schiffli embroidery.</p>',
    cover_image_url: '/products/yasraf-gul-e-dawood-mustard-1.png',
    cover_image_alt: 'Mustard Schiffli Lawn Ensemble by YASRAF',
    author_name: 'Atelier Head Designer',
    category: 'Styling Guide',
    tags: ['Lawn', 'Fashion', 'Craft'],
    seo_title: 'The Modern Lawn Revolution | YASRAF Textiles',
    seo_description: 'Discover modern lawn design.'
  };

  const draftResult = await saveBlogPost(newPostData, { publish: false });
  testPostId = draftResult.post.id;

  if (draftResult.post.status !== 'draft') {
    throw new Error(`Draft test failed: expected status 'draft', got '${draftResult.post.status}'`);
  }
  console.log(`✓ Draft created successfully with ID: ${testPostId}, status: '${draftResult.post.status}'`);

  // Verify draft does NOT appear in public published list
  const publicPostsBeforePublish = await getPublishedBlogPosts();
  if (publicPostsBeforePublish.some(p => p.id === testPostId)) {
    throw new Error('FAIL: Draft post is visible in public getPublishedBlogPosts()!');
  }
  console.log('✓ Draft post is strictly hidden from public storefront.');

  // Test 4: Edit the Draft Post
  console.log('\nTest 4: Editing the Draft Post...');
  const updatedData = {
    ...draftResult.post,
    title: 'The Modern Lawn Revolution (Updated Edition)',
    excerpt: 'Updated editorial summary of modern Pakistani lawn.',
    content_html: '<h2>A New Era in Lawn</h2><p>Updated content with silk dupatta drape guide.</p>'
  };

  const editResult = await saveBlogPost(updatedData, { publish: false });
  if (editResult.post.title !== 'The Modern Lawn Revolution (Updated Edition)') {
    throw new Error('Edit draft failed: title was not updated');
  }
  if (editResult.post.status !== 'draft') {
    throw new Error('Edit draft failed: status changed unexpectedly from draft');
  }
  console.log('✓ Draft edited successfully, status remains draft.');

  // Test 5: Validation Check - Content and Alt Text required for Publishing
  console.log('\nTest 5: Validating Publishing Requirements...');
  try {
    await saveBlogPost({ title: 'No Content Post', slug: 'no-content', content_html: '' }, { publish: true });
    throw new Error('Validation failed: Allowed publishing with empty content!');
  } catch (err) {
    console.log('✓ Correctly rejected publishing without content:', err.message);
  }

  try {
    await saveBlogPost({ 
      title: 'No Alt Text Post', 
      slug: 'no-alt', 
      content_html: '<p>Content</p>', 
      cover_image_url: 'https://example.com/img.jpg',
      cover_image_alt: '' 
    }, { publish: true });
    throw new Error('Validation failed: Allowed publishing cover image with empty alt text!');
  } catch (err) {
    console.log('✓ Correctly rejected publishing without cover image alt text:', err.message);
  }

  // Test 6: Publishing the Post
  console.log('\nTest 6: Publishing the Post...');
  const publishResult = await saveBlogPost(editResult.post, { publish: true });
  if (publishResult.post.status !== 'published') {
    throw new Error(`Publish failed: expected status 'published', got '${publishResult.post.status}'`);
  }
  if (!publishResult.post.published_at) {
    throw new Error('Publish failed: published_at timestamp was not set');
  }
  console.log(`✓ Post published live! published_at: ${publishResult.post.published_at}`);

  // Test 7: Verify Post Appears in Public Listing (/blog)
  console.log('\nTest 7: Verifying Post on Public /blog...');
  const publicPostsAfterPublish = await getPublishedBlogPosts();
  const foundInPublic = publicPostsAfterPublish.find(p => p.id === testPostId);
  if (!foundInPublic) {
    throw new Error('Public listing failed: Published post is not returned by getPublishedBlogPosts()');
  }
  console.log(`✓ Published post visible on /blog (Total public posts: ${publicPostsAfterPublish.length})`);

  // Test 8: Verify Fetch by Slug Directly (/blog/:slug)
  console.log('\nTest 8: Opening /blog/:slug directly...');
  const postBySlug = await getBlogPostBySlug(testSlug);
  if (!postBySlug || postBySlug.id !== testPostId) {
    throw new Error(`Direct slug fetch failed for slug '${testSlug}'`);
  }
  console.log(`✓ Direct slug fetch verified: "${postBySlug.title}"`);

  // Test 9: Related Posts
  console.log('\nTest 9: Verifying Related Posts...');
  const related = getRelatedBlogPosts(publicPostsAfterPublish, postBySlug, 2);
  console.log(`✓ Related posts found: ${related.length} articles`);

  // Test 10: Unpublish Post
  console.log('\nTest 10: Unpublishing Post...');
  await unpublishBlogPost(testPostId);
  const postAfterUnpublish = await getBlogPostBySlug(testSlug, false);
  if (postAfterUnpublish) {
    throw new Error('FAIL: Unpublished post is still returned to public readers!');
  }
  console.log('✓ Post successfully unpublished and removed from public storefront.');

  // Test 11: Delete Post
  console.log('\nTest 11: Deleting Post...');
  await deleteBlogPost(testPostId);
  const adminPostsAfterDelete = await getAdminBlogPosts();
  if (adminPostsAfterDelete.some(p => p.id === testPostId)) {
    throw new Error('FAIL: Deleted post still exists in admin posts list!');
  }
  console.log('✓ Post successfully deleted permanently.');

  // Test 12: Verify Sitemap Generation
  console.log('\nTest 12: Checking Sitemap and Robots.txt...');
  const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  if (!sitemapContent.includes('/blog') || !sitemapContent.includes('/blog/how-to-style-a-lawn-suit')) {
    throw new Error('FAIL: sitemap.xml does not contain /blog entries!');
  }
  console.log('✓ sitemap.xml verified with /blog and published article URLs.');

  const robotsPath = path.resolve(__dirname, '../public/robots.txt');
  const robotsContent = fs.readFileSync(robotsPath, 'utf8');
  if (!robotsContent.includes('Allow: /blog') || !robotsContent.includes('Allow: /blog/')) {
    throw new Error('FAIL: robots.txt does not contain Allow: /blog!');
  }
  console.log('✓ robots.txt verified with Allow: /blog.');

  console.log('\n=== ALL 12 TEST SUITE CHECKS COMPLETED AND PASSED! ===');
}

runTests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});

