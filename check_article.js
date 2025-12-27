const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xvunmbesvsurmslijlyz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2dW5tYmVzdnN1cm1zbGlqbHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NDg5NDgsImV4cCI6MjA4MjMyNDk0OH0.ljxwN09na-_KG0xnbSY57HeqyFhlyci0gu5_1tGGTcE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkArticle() {
  const { data, error } = await supabase
    .from('articles')
    .select('title, updated_at')
    .eq('id', '3a09ff00-3240-42ab-8c98-1187e35d9afc')
    .single();
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Article title:', data.title);
  console.log('Updated at:', data.updated_at);
}

checkArticle();
