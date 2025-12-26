-- ============================================
-- ИСПРАВЛЕНИЕ: Storage политики для загрузки изображений
-- Запустите этот SQL в Supabase SQL Editor
-- ============================================

-- Удаляем старые политики если есть
DROP POLICY IF EXISTS "Allow public read images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete images" ON storage.objects;

-- Создаём новые политики с правильными правами

-- 1. Публичное чтение изображений
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'article-images' );

-- 2. Любой может загружать изображения (без аутентификации для простоты)
CREATE POLICY "Anyone can upload images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'article-images' );

-- 3. Любой может обновлять изображения
CREATE POLICY "Anyone can update images"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'article-images' );

-- 4. Любой может удалять изображения
CREATE POLICY "Anyone can delete images"
ON storage.objects FOR DELETE
USING ( bucket_id = 'article-images' );

-- Проверяем что политики созданы
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';
