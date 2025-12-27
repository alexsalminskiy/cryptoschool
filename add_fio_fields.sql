-- ============================================
-- Добавление полей ФИО в таблицу profiles
-- Запустите этот SQL в Supabase SQL Editor
-- ============================================

-- Добавляем поля ФИО
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS middle_name TEXT;

-- Создаем индекс для поиска по ФИО
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(last_name, first_name);

-- Проверяем структуру
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
