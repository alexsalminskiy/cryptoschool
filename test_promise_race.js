const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xvunmbesvsurmslijlyz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2dW5tYmVzdnN1cm1zbGlqbHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NDg5NDgsImV4cCI6MjA4MjMyNDk0OH0.ljxwN09na-_KG0xnbSY57HeqyFhlyci0gu5_1tGGTcE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPromiseRace() {
  console.log('Testing Promise.race with Supabase...');
  
  const articleData = {
    title: 'Race Test ' + Date.now(),
    slug: 'race-test-' + Date.now(),
    category: 'blockchain',
    content_md: '# Test',
    status: 'published',
    views: 0
  };
  
  try {
    // Копируем логику из page.js
    const savePromise = supabase
      .from('articles')
      .insert([articleData])
      .select()
      .single();

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Таймаут - попробуйте ещё раз')), 15000)
    );

    console.log('Waiting for Promise.race...');
    const result = await Promise.race([savePromise, timeoutPromise]);
    
    console.log('Result type:', typeof result);
    console.log('Result:', result);
    
    // Проверяем структуру
    const { data, error } = result;
    console.log('Data:', data);
    console.log('Error:', error);
    
  } catch (e) {
    console.error('Caught exception:', e.message);
  }
}

testPromiseRace();
