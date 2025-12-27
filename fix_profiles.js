const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xvunmbesvsurmslijlyz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2dW5tYmVzdnN1cm1zbGlqbHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NDg5NDgsImV4cCI6MjA4MjMyNDk0OH0.ljxwN09na-_KG0xnbSY57HeqyFhlyci0gu5_1tGGTcE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProfiles() {
  // Обновляем профили где ФИО = undefined
  const { data, error } = await supabase
    .from('profiles')
    .update({
      first_name: null,
      last_name: null,
      middle_name: null
    })
    .eq('first_name', 'undefined');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Fixed profiles with undefined names');
}

fixProfiles();
