-- ============================================
-- ОБНОВЛЕНИЕ: Добавление системы одобрения пользователей
-- Запустите этот SQL в Supabase SQL Editor
-- ============================================

-- Добавить поле approved в таблицу profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;

-- Добавить поле approved_at для отслеживания времени одобрения
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Добавить поле approved_by для отслеживания кто одобрил
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id);

-- Создать индекс для быстрого поиска неодобренных пользователей
CREATE INDEX IF NOT EXISTS idx_profiles_approved ON profiles(approved);

-- Обновить существующих админов - они автоматически одобрены
UPDATE profiles 
SET approved = true, approved_at = NOW()
WHERE role = 'admin' AND approved = false;

-- Комментарии к полям
COMMENT ON COLUMN profiles.approved IS 'Одобрен ли пользователь администратором для доступа к статьям';
COMMENT ON COLUMN profiles.approved_at IS 'Дата и время одобрения пользователя';
COMMENT ON COLUMN profiles.approved_by IS 'ID администратора, который одобрил пользователя';
