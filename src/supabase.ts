import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL || 'https://fslyhshcdsskmqnwltbg.supabase.co';
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!key) throw new Error('Supabase publishable key missing');
export const supabase = createClient(url, key);