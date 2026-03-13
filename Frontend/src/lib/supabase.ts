import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
// const supabaseServiceRole = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure .env contains:\n' +
    '  - VITE_SUPABASE_URL\n' +
    '  -  VITE_SUPABASE_PUBLISHABLE_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, );
