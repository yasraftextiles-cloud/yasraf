alter table public.products
  add column if not exists product_video_path text,
  add column if not exists product_instagram_url text;

create index if not exists products_published_video_path_idx
  on public.products (product_video_path)
  where is_published and product_video_path is not null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-videos', 'product-videos', false, 26214400, array['video/mp4']);

create policy "Admins can upload product videos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-videos' and (select public.is_admin())
    and name ~ '^catalog/[0-9a-f-]{36}[.]mp4$'
  );

create policy "Admins can read product videos" on storage.objects
  for select to authenticated
  using (bucket_id = 'product-videos' and (select public.is_admin()));

create policy "Visitors can read published product videos" on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'product-videos' and exists (
      select 1 from public.products as product
      where product.is_published and product.product_video_path = objects.name
    )
  );

-- Preserve the current catalog RPC and its variant logic. The wrapper is
-- invoker-rights and rolls back the entire save if media cannot be persisted.
create or replace function public.save_product_with_media(payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  result jsonb;
  video_path text := nullif(btrim(payload->>'product_video_path'), '');
  instagram_url text := nullif(btrim(payload->>'product_instagram_url'), '');
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'Only administrators can save product media' using errcode = '42501';
  end if;

  if video_path is not null and (
    video_path !~ '^catalog/[0-9a-f-]{36}[.]mp4$' or not exists (
      select 1 from storage.objects where bucket_id = 'product-videos' and name = video_path
    )
  ) then
    raise exception 'Upload a valid product video before saving';
  end if;

  if instagram_url is not null and (video_path is null
    or instagram_url !~ '^https://www[.]instagram[.]com/(reel|p|tv)/[A-Za-z0-9_-]+/$') then
    raise exception 'Add a valid Instagram Reel or post link to an uploaded video';
  end if;

  result := public.save_product_with_variants(payload - 'product_video_path' - 'product_instagram_url');
  if not coalesce((result->>'success')::boolean, false) then
    raise exception 'Product could not be saved';
  end if;

  update public.products
    set product_video_path = video_path, product_instagram_url = instagram_url
    where id = result->>'product_id';
  if not found then
    raise exception 'Product media could not be saved';
  end if;
  return result;
end;
$$;

revoke all on function public.save_product_with_media(jsonb) from public, anon;
grant execute on function public.save_product_with_media(jsonb) to authenticated;
