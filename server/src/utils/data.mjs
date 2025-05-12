import {createClient} from '@supabase/supabase-js';

// Инициализация пула соединений
const supabase = createClient('https://iciayccshablgtiuzroy.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljaWF5Y2NzaGFibGd0aXV6cm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNTI5MzksImV4cCI6MjA2MjYyODkzOX0.EA95aU5At81e_oCvxiYMke3ZpyvOC05hxHeL0WWGXR4')

// Проверка соединения
async function testConnection() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Connection error:', error);
  } else {
    console.log('Connected successfully');
  }
}

testConnection();

export default supabase;