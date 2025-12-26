-- ============================================
-- Crypto Academy - Database Setup Script
-- Run this in Supabase SQL Editor
-- ============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content_md TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Allow public read profiles" ON profiles;
CREATE POLICY "Allow public read profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow users insert own profile" ON profiles;
CREATE POLICY "Allow users insert own profile" ON profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users update own profile" ON profiles;
CREATE POLICY "Allow users update own profile" ON profiles FOR UPDATE USING (true);

-- Articles policies  
DROP POLICY IF EXISTS "Allow public read published articles" ON articles;
CREATE POLICY "Allow public read published articles" ON articles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin insert articles" ON articles;
CREATE POLICY "Allow admin insert articles" ON articles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin update articles" ON articles;
CREATE POLICY "Allow admin update articles" ON articles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow admin delete articles" ON articles;
CREATE POLICY "Allow admin delete articles" ON articles FOR DELETE USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Auto-update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to articles table
DROP TRIGGER IF EXISTS articles_updated_at ON articles;
CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert default admin user (you'll need to set the password via Supabase Auth)
-- This creates a profile entry ready for your admin account
INSERT INTO profiles (email, role) 
VALUES ('admin@cryptoacademy.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- Storage Bucket Setup
-- ============================================
-- Note: You need to create the storage bucket manually:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "Create Bucket"
-- 3. Name: "article-images"
-- 4. Public: Yes
-- 5. Then run these policies in SQL Editor:

-- Storage policies for article-images bucket
-- (Run these AFTER creating the bucket)
-- CREATE POLICY "Allow public read images" ON storage.objects 
--   FOR SELECT USING (bucket_id = 'article-images');
-- 
-- CREATE POLICY "Allow authenticated upload images" ON storage.objects 
--   FOR INSERT WITH CHECK (bucket_id = 'article-images' AND auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Allow authenticated delete images" ON storage.objects 
--   FOR DELETE USING (bucket_id = 'article-images' AND auth.role() = 'authenticated');

