const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xvunmbesvsurmslijlyz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2dW5tYmVzdnN1cm1zbGlqbHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NDg5NDgsImV4cCI6MjA4MjMyNDk0OH0.ljxwN09na-_KG0xnbSY57HeqyFhlyci0gu5_1tGGTcE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function directQuery() {
  // Сначала обновим обратно
  const { data: updated, error: updateError } = await supabase
    .from('articles')
    .update({ title: 'Binance: полный обзор криптовалютной онлайн-платформы ОБНОВЛЕНО' })
    .eq('id', '3a09ff00-3240-42ab-8c98-1187e35d9afc')
    .select()
    .single();
  
  if (updateError) {
    console.error('Update error:', updateError);
    return;
  }
  
  console.log('Updated article:', updated.title);
  console.log('Updated at:', updated.updated_at);
  
  // Теперь запросим снова
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', '3a09ff00-3240-42ab-8c98-1187e35d9afc')
    .single();
  
  if (error) {
    console.error('Select error:', error);
    return;
  }
  
  console.log('\nAfter update - title:', data.title);
  console.log('After update - updated_at:', data.updated_at);
}

directQuery();
