import { supabase } from '@/integrations/supabase/client';
import type { Database } from './types';

// ✅ Your actual Supabase backend URL
const SUPABASE_URL = 'https://yxwlkxcgnlkskfarpffa.supabase.co';

// ✅ Your Supabase anon/public key (keep this safe!)
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4d2xreGNnbmxrc2tmYXJwZmZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTE1NjcsImV4cCI6MjA2NTU2NzU2N30.vST_4CCzVNowrD_jNET2-AfMhn72woqtomK-bcwUsUM';

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
