
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Use the provided Supabase URL and key
const supabaseUrl = 'https://lppiyvqfpkrqahquyyur.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwcGl5dnFmcGtycWFocXV5eXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5MzQyMjUsImV4cCI6MjA1OTUxMDIyNX0.yV8uwQwaB8wX17M41vjasV1WHNCD0ETecpI90S37m3o';

// Log connection info for debugging
console.log('Connecting to Supabase at:', supabaseUrl);

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
