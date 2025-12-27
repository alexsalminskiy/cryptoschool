-- =====================================================
-- ТРИГГЕР ДЛЯ АВТОМАТИЧЕСКОГО СОЗДАНИЯ ПРОФИЛЯ
-- Запустите этот SQL в Supabase Dashboard → SQL Editor
-- =====================================================

-- Создаём функцию которая автоматически создаёт профиль при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, approved, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    false,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Удаляем старый триггер если есть
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Создаём триггер
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Проверяем
SELECT 'Триггер создан! Теперь профили будут создаваться автоматически.' as result;
