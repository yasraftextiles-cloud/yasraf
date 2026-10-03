-- =====================================================================
-- Migration: 20261001010000_admin_catalog_and_storage.sql
-- YASRAF CLOTHING — ADMIN CATALOG, COLLECTIONS, STORAGE & ROLES
-- =====================================================================

-- 0. Ensure pgcrypto extension is installed
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- =====================================================================
-- 1. ADMIN USER ROLES & HELPER FUNCTION
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ) OR (
    coalesce(auth.jwt()->'app_metadata'->>'role', '') = 'admin'
  );
$$;

DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- =====================================================================
-- 2. COLLECTIONS TABLE & SEEDING
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.collections (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  badge TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active collections" ON public.collections;
CREATE POLICY "Public can view active collections" ON public.collections
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage collections" ON public.collections;
CREATE POLICY "Admins can manage collections" ON public.collections
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed initial brand collections
INSERT INTO public.collections (id, slug, title, description, badge, is_active)
VALUES
  ('col-new-in', 'new-in', 'New In', 'Latest seasonal drops and couture debuts', 'NEW', true),
  ('col-ready-to-wear', 'ready-to-wear', 'Ready to Wear', 'Effortless daytime elegance & luxury stitched shirts', NULL, true),
  ('col-luxury-pret', 'luxury-pret', 'Luxury Prêt', 'Heavily embellished artisanal festive & evening ensembles', 'LUXE', true),
  ('col-party-wear', 'party-wear', 'Party Wear', 'Statement silhouettes for formal soirées & gatherings', NULL, true),
  ('col-winter', 'winter-collection', 'Winter Collection', 'Rich velvet, warm karandi and pashmina shawls', NULL, true),
  ('col-best-sellers', 'best-sellers', 'Best Sellers', 'Most sought-after signature pieces', 'HOT', true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  badge = EXCLUDED.badge,
  is_active = EXCLUDED.is_active;

-- =====================================================================
-- 3. PRODUCTS TABLE COLUMNS & COMPATIBILITY
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  subheading TEXT,
  category TEXT NOT NULL,
  category_label TEXT,
  collections TEXT[] DEFAULT '{}',
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10,2) CHECK (original_price IS NULL OR original_price >= price),
  badge TEXT,
  rating NUMERIC(3,2) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  reviews_count INT DEFAULT 0 CHECK (reviews_count >= 0),
  description TEXT,
  details TEXT[] DEFAULT '{}',
  fabric TEXT,
  includes TEXT,
  care_instructions TEXT,
  size_guide JSONB DEFAULT '{}'::jsonb,
  related_product_ids TEXT[] DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  sizes TEXT[] NOT NULL DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Backwards-compatibility checks for existing products table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='slug') THEN
    ALTER TABLE public.products ADD COLUMN slug TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='subheading') THEN
    ALTER TABLE public.products ADD COLUMN subheading TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='category_label') THEN
    ALTER TABLE public.products ADD COLUMN category_label TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='collections') THEN
    ALTER TABLE public.products ADD COLUMN collections TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='includes') THEN
    ALTER TABLE public.products ADD COLUMN includes TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='care_instructions') THEN
    ALTER TABLE public.products ADD COLUMN care_instructions TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='size_guide') THEN
    ALTER TABLE public.products ADD COLUMN size_guide JSONB DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='related_product_ids') THEN
    ALTER TABLE public.products ADD COLUMN related_product_ids TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='is_published') THEN
    ALTER TABLE public.products ADD COLUMN is_published BOOLEAN DEFAULT false;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(is_published);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products" ON public.products
  FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================================
-- 4. PRODUCT VARIANTS TABLE & RLS
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(product_id, size, color)
);

CREATE INDEX IF NOT EXISTS idx_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.product_variants(sku);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published product variants" ON public.product_variants;
CREATE POLICY "Public can view published product variants" ON public.product_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_variants.product_id AND p.is_published = true
    )
  );

DROP POLICY IF EXISTS "Admins can manage product variants" ON public.product_variants;
CREATE POLICY "Admins can manage product variants" ON public.product_variants
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =====================================================================
-- 5. ATOMIC SAVE PRODUCT WITH VARIANTS RPC
-- =====================================================================
CREATE OR REPLACE FUNCTION public.save_product_with_variants(payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
  v_id TEXT;
  v_slug TEXT;
  v_title TEXT;
  v_category TEXT;
  v_price NUMERIC;
  v_original_price NUMERIC;
  v_variants JSONB;
  v_var RECORD;
  v_existing_id UUID;
  v_submitted_variant_ids UUID[] := ARRAY[]::UUID[];
  v_is_published BOOLEAN;
  v_product_exists BOOLEAN := false;
  v_result JSONB;
BEGIN
  -- 1. Security Check: Only verified administrators can execute
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access Denied: Only administrators can save products and variants';
  END IF;

  -- 2. Input Validations
  v_title := trim(coalesce(payload->>'title', ''));
  IF v_title = '' THEN
    RAISE EXCEPTION 'Product title is required';
  END IF;

  v_price := (payload->>'price')::NUMERIC;
  IF v_price IS NULL OR v_price < 0 THEN
    RAISE EXCEPTION 'Valid positive price in PKR is required';
  END IF;

  IF payload ? 'original_price' AND payload->>'original_price' IS NOT NULL AND trim(payload->>'original_price') <> '' THEN
    v_original_price := (payload->>'original_price')::NUMERIC;
    IF v_original_price < v_price THEN
      RAISE EXCEPTION 'Compare-at price (%) cannot be less than regular price (%)', v_original_price, v_price;
    END IF;
  ELSE
    v_original_price := NULL;
  END IF;

  -- Determine if editing existing product
  v_id := nullif(trim(coalesce(payload->>'id', '')), '');
  IF v_id IS NOT NULL THEN
    SELECT EXISTS (SELECT 1 FROM public.products WHERE id = v_id) INTO v_product_exists;
  END IF;

  -- Slug generation / sanitization
  v_slug := lower(regexp_replace(trim(coalesce(payload->>'slug', v_title)), '[^a-zA-Z0-9]+', '-', 'g'));
  v_slug := trim(both '-' from v_slug);
  IF v_slug = '' THEN
    v_slug := 'product-' || floor(random() * 90000 + 10000)::text;
  END IF;

  -- Ensure slug uniqueness across other products
  IF EXISTS (SELECT 1 FROM public.products WHERE slug = v_slug AND (v_id IS NULL OR id <> v_id)) THEN
    v_slug := v_slug || '-' || floor(random() * 9000 + 1000)::text;
  END IF;

  -- If not existing product, assign ID
  IF v_id IS NULL OR NOT v_product_exists THEN
    v_id := coalesce(v_id, 'yas-' || v_slug);
  END IF;

  -- Determine publication status:
  -- If payload explicitly provides is_published, use it.
  -- Otherwise, if product already exists, preserve current status; default to false for new.
  IF payload ? 'is_published' AND payload->>'is_published' IS NOT NULL THEN
    v_is_published := (payload->>'is_published')::BOOLEAN;
  ELSIF v_product_exists THEN
    SELECT is_published FROM public.products WHERE id = v_id INTO v_is_published;
  ELSE
    v_is_published := false;
  END IF;

  -- 3. Upsert Product record atomically
  INSERT INTO public.products (
    id,
    slug,
    title,
    subheading,
    category,
    category_label,
    collections,
    price,
    original_price,
    badge,
    description,
    fabric,
    includes,
    care_instructions,
    size_guide,
    related_product_ids,
    images,
    colors,
    sizes,
    is_published,
    is_new,
    is_featured,
    updated_at
  ) VALUES (
    v_id,
    v_slug,
    v_title,
    nullif(trim(payload->>'subheading'), ''),
    coalesce(nullif(trim(payload->>'category'), ''), 'luxury-pret'),
    nullif(trim(payload->>'category_label'), ''),
    coalesce((SELECT array_agg(x::text) FROM jsonb_array_elements_text(coalesce(payload->'collections', '[]'::jsonb)) x), ARRAY[]::TEXT[]),
    v_price,
    v_original_price,
    nullif(trim(payload->>'badge'), ''),
    coalesce(payload->>'description', ''),
    coalesce(payload->>'fabric', ''),
    coalesce(payload->>'includes', ''),
    coalesce(payload->>'care_instructions', ''),
    coalesce(payload->'size_guide', '{}'::jsonb),
    coalesce((SELECT array_agg(x::text) FROM jsonb_array_elements_text(coalesce(payload->'related_product_ids', '[]'::jsonb)) x), ARRAY[]::TEXT[]),
    coalesce((SELECT array_agg(x::text) FROM jsonb_array_elements_text(coalesce(payload->'images', '[]'::jsonb)) x), ARRAY[]::TEXT[]),
    coalesce(payload->'colors', '[]'::jsonb),
    coalesce((SELECT array_agg(x::text) FROM jsonb_array_elements_text(coalesce(payload->'sizes', '[]'::jsonb)) x), ARRAY[]::TEXT[]),
    v_is_published,
    coalesce((payload->>'is_new')::BOOLEAN, false),
    coalesce((payload->>'is_featured')::BOOLEAN, false),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    title = EXCLUDED.title,
    subheading = EXCLUDED.subheading,
    category = EXCLUDED.category,
    category_label = EXCLUDED.category_label,
    collections = EXCLUDED.collections,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    badge = EXCLUDED.badge,
    description = EXCLUDED.description,
    fabric = EXCLUDED.fabric,
    includes = EXCLUDED.includes,
    care_instructions = EXCLUDED.care_instructions,
    size_guide = EXCLUDED.size_guide,
    related_product_ids = EXCLUDED.related_product_ids,
    images = EXCLUDED.images,
    colors = EXCLUDED.colors,
    sizes = EXCLUDED.sizes,
    is_published = EXCLUDED.is_published,
    is_new = EXCLUDED.is_new,
    is_featured = EXCLUDED.is_featured,
    updated_at = timezone('utc'::text, now());

  -- 4. Process Variants atomically
  v_variants := payload->'variants';
  IF v_variants IS NOT NULL AND jsonb_array_length(v_variants) > 0 THEN
    
    -- Pass 1: Validate SKUs and stock across database
    FOR v_var IN SELECT * FROM jsonb_to_recordset(v_variants) AS (
      id UUID,
      sku TEXT,
      size TEXT,
      color TEXT,
      stock INT,
      price NUMERIC
    )
    LOOP
      IF coalesce(trim(v_var.sku), '') = '' THEN
        RAISE EXCEPTION 'SKU is required for variant % / %', coalesce(v_var.size, 'Standard'), coalesce(v_var.color, 'Default');
      END IF;

      IF v_var.stock < 0 THEN
        RAISE EXCEPTION 'Stock for variant % (%) cannot be negative', v_var.sku, v_var.stock;
      END IF;

      -- A variant may retain its own SKU (id = v_var.id).
      -- If any other row in product_variants has this SKU, reject it.
      IF EXISTS (
        SELECT 1 FROM public.product_variants
        WHERE lower(sku) = lower(trim(v_var.sku))
          AND (v_var.id IS NULL OR id <> v_var.id)
      ) THEN
        RAISE EXCEPTION 'SKU "%" is already used by another variant in the database', trim(v_var.sku);
      END IF;
    END LOOP;

    -- Pass 2: Identify existing variant IDs from this product that are kept in the submission
    FOR v_var IN SELECT * FROM jsonb_to_recordset(v_variants) AS (
      id UUID,
      sku TEXT,
      size TEXT,
      color TEXT,
      stock INT,
      price NUMERIC
    )
    LOOP
      IF v_var.id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.product_variants WHERE id = v_var.id AND product_id = v_id
      ) THEN
        v_submitted_variant_ids := array_append(v_submitted_variant_ids, v_var.id);
      END IF;
    END LOOP;

    -- Pass 3: Handle explicitly removed variants
    IF v_product_exists THEN
      DELETE FROM public.product_variants
      WHERE product_id = v_id
        AND NOT (id = ANY(v_submitted_variant_ids));
    END IF;

    -- Pass 4: Update existing variants or Insert genuinely new variants
    FOR v_var IN SELECT * FROM jsonb_to_recordset(v_variants) AS (
      id UUID,
      sku TEXT,
      size TEXT,
      color TEXT,
      stock INT,
      price NUMERIC
    )
    LOOP
      -- Check if this is an existing variant of this product
      IF v_var.id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.product_variants WHERE id = v_var.id AND product_id = v_id
      ) THEN
        -- UPDATE existing variant in place, preserving its ID!
        UPDATE public.product_variants
        SET
          sku = trim(v_var.sku),
          size = coalesce(nullif(trim(v_var.size), ''), 'Standard'),
          color = coalesce(nullif(trim(v_var.color), ''), 'Default'),
          price = coalesce(v_var.price, v_price),
          stock = coalesce(v_var.stock, 0),
          updated_at = timezone('utc'::text, now())
        WHERE id = v_var.id;
      ELSE
        -- Genuinely new variant!
        -- Check if a variant with the same (product_id, size, color) exists:
        SELECT id FROM public.product_variants
        WHERE product_id = v_id
          AND size = coalesce(nullif(trim(v_var.size), ''), 'Standard')
          AND color = coalesce(nullif(trim(v_var.color), ''), 'Default')
        INTO v_existing_id;

        IF v_existing_id IS NOT NULL THEN
          UPDATE public.product_variants
          SET
            sku = trim(v_var.sku),
            price = coalesce(v_var.price, v_price),
            stock = coalesce(v_var.stock, 0),
            updated_at = timezone('utc'::text, now())
          WHERE id = v_existing_id;
        ELSE
          INSERT INTO public.product_variants (
            id,
            product_id,
            sku,
            size,
            color,
            price,
            stock,
            created_at,
            updated_at
          ) VALUES (
            coalesce(v_var.id, gen_random_uuid()),
            v_id,
            trim(v_var.sku),
            coalesce(nullif(trim(v_var.size), ''), 'Standard'),
            coalesce(nullif(trim(v_var.color), ''), 'Default'),
            coalesce(v_var.price, v_price),
            coalesce(v_var.stock, 0),
            timezone('utc'::text, now()),
            timezone('utc'::text, now())
          );
        END IF;
      END IF;
    END LOOP;
  END IF;

  SELECT jsonb_build_object(
    'success', true,
    'product_id', v_id,
    'slug', v_slug,
    'is_published', v_is_published
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- =====================================================================
-- 6. STORAGE SETUP FOR PRODUCT IMAGES (5MB Limit, WebP/JPG/PNG)
-- =====================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage RLS policies
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

-- =====================================================================
-- 7. EXPLICIT GRANTS & PRIVILEGES
-- =====================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT SELECT ON public.collections TO anon, authenticated;
GRANT SELECT ON public.store_settings TO anon, authenticated;

GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.product_variants TO authenticated;
GRANT ALL ON public.collections TO authenticated;
GRANT ALL ON public.store_settings TO authenticated;
GRANT ALL ON public.user_roles TO authenticated;

GRANT EXECUTE ON FUNCTION public.save_product_with_variants(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
