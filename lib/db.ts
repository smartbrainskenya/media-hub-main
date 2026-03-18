import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const db = (supabaseUrl && supabaseServiceRoleKey) 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

if (!db && process.env.NODE_ENV !== 'production') {
  console.warn('Supabase client not initialized - missing env variables');
}
