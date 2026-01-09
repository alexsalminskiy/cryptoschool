import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// POST /api/setup-rls - Настройка Row Level Security
export async function POST(request) {
  try {
    // Проверяем, что запрос от админа (можно добавить проверку токена)
    const results = []

    // 1. Включаем RLS для таблицы profiles
    const { error: rlsProfilesError } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;'
    })
    
    if (rlsProfilesError) {
      // Попробуем через прямой SQL
      // RPC not available
    }

    // Возвращаем инструкции для ручной настройки
    return NextResponse.json({
      success: true,
      message: 'RLS требует ручной настройки в Supabase Dashboard',
      instructions: {
        step1: 'Откройте Supabase Dashboard → SQL Editor',
        step2: 'Выполните следующие SQL команды:',
        sql: `
-- ========================================
-- 1. Включаем RLS для таблицы profiles
-- ========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Политика: Пользователи могут видеть только свой профиль
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Политика: Пользователи могут обновлять только свой профиль
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Политика: Админы могут видеть все профили
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Политика: Админы могут обновлять все профили
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Политика: Разрешить вставку при регистрации
CREATE POLICY "Enable insert for registration" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ========================================
-- 2. Включаем RLS для таблицы articles
-- ========================================
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Политика: Только одобренные пользователи могут читать статьи
CREATE POLICY "Approved users can view articles" ON articles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND (approved = true OR role = 'admin')
    )
  );

-- Политика: Только админы могут создавать статьи
CREATE POLICY "Admins can insert articles" ON articles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Политика: Только админы могут обновлять статьи
CREATE POLICY "Admins can update articles" ON articles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Политика: Только админы могут удалять статьи
CREATE POLICY "Admins can delete articles" ON articles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
        `
      }
    })

  } catch (error) {
    console.error('Setup RLS error:', error)
    return NextResponse.json(
      { error: 'Failed to setup RLS', details: error.message },
      { status: 500 }
    )
  }
}

// GET /api/setup-rls - Получить SQL инструкции
export async function GET() {
  return NextResponse.json({
    message: 'SQL инструкции для настройки RLS',
    instructions: 'Скопируйте SQL ниже и выполните в Supabase Dashboard → SQL Editor',
    sql: `
-- ========================================
-- НАСТРОЙКА ROW LEVEL SECURITY (RLS)
-- Выполните этот скрипт в Supabase SQL Editor
-- ========================================

-- 1. ТАБЛИЦА PROFILES
-- ----------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если есть
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable insert for registration" ON profiles;

-- Пользователи видят свой профиль
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Пользователи обновляют свой профиль  
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Админы видят все профили
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Админы обновляют все профили
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Вставка при регистрации
CREATE POLICY "Enable insert for registration" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. ТАБЛИЦА ARTICLES
-- ----------------------------------------
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если есть
DROP POLICY IF EXISTS "Approved users can view articles" ON articles;
DROP POLICY IF EXISTS "Admins can insert articles" ON articles;
DROP POLICY IF EXISTS "Admins can update articles" ON articles;
DROP POLICY IF EXISTS "Admins can delete articles" ON articles;

-- Одобренные пользователи читают статьи
CREATE POLICY "Approved users can view articles" ON articles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (approved = true OR role = 'admin'))
  );

-- Админы создают статьи
CREATE POLICY "Admins can insert articles" ON articles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Админы обновляют статьи
CREATE POLICY "Admins can update articles" ON articles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Админы удаляют статьи
CREATE POLICY "Admins can delete articles" ON articles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ========================================
-- ГОТОВО! RLS настроен.
-- ========================================
    `
  })
}
