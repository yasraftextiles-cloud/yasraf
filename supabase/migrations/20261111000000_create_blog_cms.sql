-- =====================================================================
-- Migration: 20261111000000_create_blog_cms.sql
-- YASRAF TEXTILES — BLOG CMS, STORAGE BUCKET & RLS POLICIES
-- =====================================================================

-- 0. Ensure pgcrypto extension is installed
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- =====================================================================
-- 1. BLOG POSTS TABLE
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(trim(title)) > 0),
  slug TEXT UNIQUE NOT NULL CHECK (char_length(trim(slug)) > 0),
  excerpt TEXT,
  content_html TEXT NOT NULL CHECK (char_length(trim(content_html)) > 0),
  cover_image_url TEXT,
  cover_image_alt TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT 'YASRAF Atelier Editorial',
  category TEXT DEFAULT 'Styling Guide',
  tags TEXT[] DEFAULT '{}',
  reading_time INTEGER DEFAULT 3 CHECK (reading_time >= 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  seo_title TEXT,
  seo_description TEXT,
  focus_keyword TEXT,
  canonical_url TEXT,
  social_image_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published ON public.blog_posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts(category);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER set_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_blog_posts_updated_at();

-- =====================================================================
-- 2. ROW LEVEL SECURITY (RLS) FOR BLOG POSTS
-- =====================================================================
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can view published blog posts only (or admins can view all)
DROP POLICY IF EXISTS "Public can view published blog posts" ON public.blog_posts;
CREATE POLICY "Public can view published blog posts" ON public.blog_posts
  FOR SELECT USING (status = 'published' OR public.is_admin());

-- Authenticated admins can create posts
DROP POLICY IF EXISTS "Admins can insert blog posts" ON public.blog_posts;
CREATE POLICY "Admins can insert blog posts" ON public.blog_posts
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

-- Authenticated admins can update posts
DROP POLICY IF EXISTS "Admins can update blog posts" ON public.blog_posts;
CREATE POLICY "Admins can update blog posts" ON public.blog_posts
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Authenticated admins can delete posts
DROP POLICY IF EXISTS "Admins can delete blog posts" ON public.blog_posts;
CREATE POLICY "Admins can delete blog posts" ON public.blog_posts
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- =====================================================================
-- 3. STORAGE BUCKET: blog-images (5MB limit, Public access, Admin write)
-- =====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-images',
  'blog-images',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage RLS policies for blog-images
DROP POLICY IF EXISTS "Public can view blog images" ON storage.objects;
CREATE POLICY "Public can view blog images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "Admins can upload blog images" ON storage.objects;
CREATE POLICY "Admins can upload blog images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update blog images" ON storage.objects;
CREATE POLICY "Admins can update blog images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'blog-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'blog-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete blog images" ON storage.objects;
CREATE POLICY "Admins can delete blog images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'blog-images' AND public.is_admin());

-- =====================================================================
-- 4. EXPLICIT GRANTS & PRIVILEGES
-- =====================================================================
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT ALL ON public.blog_posts TO authenticated;

-- =====================================================================
-- 5. INITIAL SEED BLOG POSTS (Editorial Showcase)
-- =====================================================================
INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content_html,
  cover_image_url,
  cover_image_alt,
  author_name,
  category,
  tags,
  reading_time,
  status,
  seo_title,
  seo_description,
  focus_keyword,
  canonical_url,
  social_image_url,
  published_at
) VALUES 
(
  'How to Style a Pure Lawn Suit for Spring & Summer',
  'how-to-style-a-lawn-suit',
  'Master effortless daytime poise with our atelier styling guide on layering, dupatta drapes, and statement accessories for Pakistani luxury lawn.',
  '<h2>The Enduring Poise of Pakistani Lawn</h2><p>Nothing defines the romance of South Asian warm-weather couture quite like handcrafted lawn. Crafted from high-count combed cotton and embellished with intricate Schiffli needlework, a designer three-piece lawn ensemble balances comfort with regal poise.</p><h3>1. The Fluid Silk Dupatta Drape</h3><p>For an elevated daytime look, cascade the digital-printed silk or chiffon dupatta over one shoulder, allowing the borders to align gracefully with your shirt hem. Pin discreetly at the shoulder with an artisanal brooch to keep movement uninhibited.</p><blockquote>"Luxury is not about excess; it is the quiet harmony between breathable fabric, precise tailoring, and authentic artisanal needlework."</blockquote><h3>2. Modern Footwear & Silhouettes</h3><p>Pair your embroidered lawn trousers or cigarette pants with handcrafted leather khussas for cultural authenticity, or minimalist block-heeled mules for an effortless transition from afternoon tea to an intimate dinner.</p><h3>3. Delicate Jewelry Styling</h3><ul><li>Choose antique polki or matte gold jhumkas that frame the neckline without competing with dense neckline embroidery.</li><li>Stack slender bangles or opt for an engraved cuff on the non-watch wrist.</li><li>Keep your makeup dewy and luminous with a warm terracotta or rose-petal lip stain.</li></ul>',
  '/products/yasraf-gul-e-dawood-mustard-1.png',
  'YASRAF Luxury Embroidered 3-Piece Lawn Suit in Mustard and Black',
  'YASRAF Atelier Editorial',
  'Styling Guide',
  ARRAY['Lawn Styling', 'Summer Fashion', 'Ready to Wear', 'Pakistani Couture'],
  4,
  'published',
  'How to Style a Lawn Suit | Pakistani Fashion Guide | YASRAF Textiles',
  'Discover expert styling tips for wearing luxury embroidered lawn suits in Pakistan. Learn dupatta drapes, accessory pairings, and footwear styling.',
  'style a lawn suit',
  'https://yasraftextiles.com/blog/how-to-style-a-lawn-suit',
  '/products/yasraf-gul-e-dawood-mustard-1.png',
  timezone('utc'::text, now()) - interval '3 days'
),
(
  'The Art of Schiffli Embroidery: Preserving Heritage in Modern Pret',
  'art-of-schiffli-embroidery',
  'Explore the intricate history of Schiffli cutwork and how YASRAF artisans integrate centuries-old needlework into contemporary ready-to-wear silhouettes.',
  '<h2>Bridging Timeless Craft & Contemporary Silhouettes</h2><p>Schiffli embroidery represents one of the pinnacle achievements in textile embellishment. Named after the Swiss-German dialect word for "little boat"—referencing the shuttle that weaves the intricate lower threads—this technique produces breathtaking lace-like textures and scalloped borders.</p><h3>From Raw Fabric to Couture Masterpiece</h3><p>At YASRAF, every Schiffli design begins with a hand-drawn botanical motif inspired by Mughal architecture and Persian flora. Our master artisans calibrate thread tension to maintain feather-light drape while ensuring each cutout is crisp and enduring.</p><h3>The Schiffli Edit: Daytime to Soiree</h3><p>Unlike heavy bridal wirework, Schiffli embroidery offers sheer elegance suitable for summer luncheons, formal meetings, and festive dinners. The subtle play of light filtering through eyelet cutwork adds a three-dimensional depth unmatched by conventional printing.</p>',
  '/products/yasraf-zehra-plum-1.png',
  'Intricate Schiffli embroidery on YASRAF luxury pret ensemble',
  'YASRAF Atelier Editorial',
  'Artisanal Heritage',
  '{"Schiffli", "Embroidery", "Heritage Craft", "Luxury Pret"}',
  5,
  'published',
  'The Art of Schiffli Embroidery | Textile Heritage | YASRAF Textiles',
  'Explore the craftsmanship of Schiffli embroidery in Pakistani luxury pret. Learn about heritage needlework, cutwork techniques, and modern styling.',
  'schiffli embroidery',
  'https://yasraftextiles.com/blog/art-of-schiffli-embroidery',
  '/products/yasraf-zehra-plum-1.png',
  timezone('utc'::text, now()) - interval '7 days'
),
(
  'Caring for Pure Silk & Organza: The Atelier Care Guide',
  'silk-organza-care-guide',
  'Extend the heirloom longevity of your formal silks, raw silk kurtas, and delicate organza dupattas with these essential maintenance guidelines.',
  '<h2>Protecting Your Heirloom Investment</h2><p>Pure silk and hand-woven organza are living, breathable textiles that demand tender preservation. Follow these atelier-tested guidelines to keep your precious garments as luminous as the day they were stitched.</p><h3>1. Cleansing & Washing Protocol</h3><p>Always opt for professional dry cleaning for embroidered and multi-panel garments. If hand-washing unembellished raw silk separates, use cold water and a pH-neutral silk rinse. Never wring or twist delicate weave fibers.</p><h3>2. Ironing and Steaming</h3><p>Always press pure silks on the reverse side using a damp press cloth and low silk heat setting. For structured organza dupattas and cutwork sleeves, prefer vertical gentle steaming rather than direct iron pressure.</p><h3>3. Seasonal Storage</h3><ul><li>Store silk ensembles in breathable cotton muslin bags, never in airtight synthetic plastic.</li><li>Avoid direct cedar contact; use lavender or natural neem sachets to deter insects.</li><li>Refold garments every few months to prevent fiber memory and permanent crease lines.</li></ul>',
  '/products/yasraf-firouzeh-emerald-1.png',
  'Pure festive organza and emerald silk ensemble preservation guide',
  'YASRAF Atelier Editorial',
  'Fabric Care',
  '{"Fabric Care", "Silk Maintenance", "Organza Care", "Wardrobe Guide"}',
  3,
  'published',
  'Silk & Organza Care Guide | Maintain Luxury Ensembles | YASRAF Textiles',
  'Learn how to properly wash, iron, and store pure silk and organza dresses in Pakistan. Expert atelier garment care advice from YASRAF Textiles.',
  'silk organza fabric care',
  'https://yasraftextiles.com/blog/silk-organza-care-guide',
  '/products/yasraf-firouzeh-emerald-1.png',
  timezone('utc'::text, now()) - interval '14 days'
)
ON CONFLICT (slug) DO NOTHING;

