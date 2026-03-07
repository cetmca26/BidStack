-- Create storage buckets for player photos and team logos
-- Allows anonymous users to upload files

-- Insert buckets into storage.buckets table
INSERT INTO storage.buckets (id, name, public, owner, created_at, updated_at, file_size_limit, allowed_mime_types)
VALUES 
  ('player-photos', 'player-photos', true, NULL, now(), now(), 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('team-logos', 'team-logos', true, NULL, now(), now(), 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Policy for player-photos: Allow anonymous uploads to player-photos bucket
DROP POLICY IF EXISTS "Allow anonymous uploads to player-photos" ON storage.objects;
CREATE POLICY "Allow anonymous uploads to player-photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'player-photos');

-- Policy for player-photos: Allow public read access
DROP POLICY IF EXISTS "Allow public read access to player-photos" ON storage.objects;
CREATE POLICY "Allow public read access to player-photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'player-photos');

-- Policy for team-logos: Allow anonymous uploads to team-logos bucket
DROP POLICY IF EXISTS "Allow anonymous uploads to team-logos" ON storage.objects;
CREATE POLICY "Allow anonymous uploads to team-logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'team-logos');

-- Policy for team-logos: Allow public read access
DROP POLICY IF EXISTS "Allow public read access to team-logos" ON storage.objects;
CREATE POLICY "Allow public read access to team-logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-logos');

-- Optional: Allow authenticated users to delete their own uploads
DROP POLICY IF EXISTS "Allow users to delete their uploads" ON storage.objects;
CREATE POLICY "Allow users to delete their uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('player-photos', 'team-logos')
  AND auth.uid() IS NOT NULL
);
