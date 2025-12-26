-- ============================================
-- ИСПРАВЛЕНИЕ: Связать профиль с auth пользователем
-- Запустите этот SQL в Supabase SQL Editor
-- ============================================

-- Проверяем текущее состояние
SELECT 
  p.id as profile_id,
  p.email as profile_email,
  p.role,
  p.approved,
  u.id as auth_user_id,
  u.email as auth_email
FROM profiles p
LEFT JOIN auth.users u ON p.email = u.email
WHERE p.email = 'alexsalminskiy@proton.me';

-- Если profile_id не равен auth_user_id, обновляем:
UPDATE profiles 
SET id = (
  SELECT id FROM auth.users 
  WHERE email = 'alexsalminskiy@proton.me'
)
WHERE email = 'alexsalminskiy@proton.me';

-- Проверяем что всё правильно
SELECT id, email, role, approved 
FROM profiles 
WHERE email = 'alexsalminskiy@proton.me';
