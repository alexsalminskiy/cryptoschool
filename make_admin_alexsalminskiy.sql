-- ============================================
-- Назначение администратора для alexsalminskiy@proton.me
-- Запустите этот SQL в Supabase SQL Editor
-- ============================================

-- Обновить пользователя и сделать его администратором
UPDATE profiles 
SET 
  role = 'admin',
  approved = true,
  approved_at = NOW()
WHERE email = 'alexsalminskiy@proton.me';

-- Проверить результат
SELECT 
  email, 
  role, 
  approved,
  approved_at,
  created_at
FROM profiles 
WHERE email = 'alexsalminskiy@proton.me';
