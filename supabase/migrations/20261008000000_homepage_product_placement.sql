-- =====================================================================
-- Migration: 20261008000000_homepage_product_placement.sql
-- YASRAF CLOTHING — HOMEPAGE PRODUCT PLACEMENT CONTROL
-- Adds explicit placement toggles:
--   show_in_new_arrivals (boolean DEFAULT false)
--   show_in_signature_edit (boolean DEFAULT false)
-- Updates save_product_with_variants RPC for atomic admin saves.
-- =====================================================================

-- 1. Add placement columns if not existing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'show_in_new_arrivals'
  ) THEN
    ALTER TABLE public.products ADD COLUMN show_in_new_arrivals BOOLEAN NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'show_in_signature_edit'
  ) THEN
    ALTER TABLE public.products ADD COLUMN show_in_signature_edit BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- 2. Create partial indexes for fast homepage filtering
CREATE INDEX IF NOT EXISTS idx_products_show_in_new_arrivals 
  ON public.products(show_in_new_arrivals) 
  WHERE show_in_new_arrivals = true;

CREATE INDEX IF NOT EXISTS idx_products_show_in_signature_edit 
  ON public.products(show_in_signature_edit) 
  WHERE show_in_signature_edit = true;

-- 3. Update save_product_with_variants function to support placement fields
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
    show_in_new_arrivals,
    show_in_signature_edit,
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
    coalesce((payload->>'show_in_new_arrivals')::BOOLEAN, false),
    coalesce((payload->>'show_in_signature_edit')::BOOLEAN, false),
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
    show_in_new_arrivals = EXCLUDED.show_in_new_arrivals,
    show_in_signature_edit = EXCLUDED.show_in_signature_edit,
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

      -- Check SKU uniqueness
      IF EXISTS (
        SELECT 1 FROM public.product_variants
        WHERE sku = trim(v_var.sku)
          AND (v_var.id IS NULL OR id <> v_var.id)
      ) THEN
        RAISE EXCEPTION 'SKU "%" is already used by another variant in the database', trim(v_var.sku);
      END IF;

      IF v_var.id IS NOT NULL THEN
        v_submitted_variant_ids := array_append(v_submitted_variant_ids, v_var.id);
      END IF;
    END LOOP;

    -- Pass 2: Clean up removed variants for this product
    IF v_product_exists THEN
      IF array_length(v_submitted_variant_ids, 1) > 0 THEN
        DELETE FROM public.product_variants
        WHERE product_id = v_id
          AND id != ALL(v_submitted_variant_ids);
      ELSE
        DELETE FROM public.product_variants
        WHERE product_id = v_id;
      END IF;
    END IF;

    -- Pass 3: Upsert/Insert variants
    FOR v_var IN SELECT * FROM jsonb_to_recordset(v_variants) AS (
      id UUID,
      sku TEXT,
      size TEXT,
      color TEXT,
      stock INT,
      price NUMERIC
    )
    LOOP
      IF v_var.id IS NOT NULL AND EXISTS (SELECT 1 FROM public.product_variants WHERE id = v_var.id) THEN
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
    'is_published', v_is_published,
    'show_in_new_arrivals', coalesce((payload->>'show_in_new_arrivals')::BOOLEAN, false),
    'show_in_signature_edit', coalesce((payload->>'show_in_signature_edit')::BOOLEAN, false)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_product_with_variants(jsonb) TO authenticated;
