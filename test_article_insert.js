const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xvunmbesvsurmslijlyz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2dW5tYmVzdnN1cm1zbGlqbHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NDg5NDgsImV4cCI6MjA4MjMyNDk0OH0.ljxwN09na-_KG0xnbSY57HeqyFhlyci0gu5_1tGGTcE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('Testing article insert...');
  
  const articleData = {
    title: 'Тестовая статья ' + Date.now(),
    slug: 'test-article-' + Date.now(),
    category: 'blockchain',
    cover_image_url: null,
    content_md: '# Тестовый контент\n\nЭто тест.',
    status: 'published',
    views: 0
  };
  
  console.log('Article data:', articleData);
  
  try {
    const { data, error } = await supabase
      .from('articles')
      .insert([articleData])
      .select()
      .single();
    
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success! Article created:', data);
    }
  } catch (e) {
    console.error('Exception:', e);
  }
}

testInsert();
