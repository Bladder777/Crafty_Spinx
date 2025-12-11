import { createClient } from '@supabase/supabase-js';

// We try to use the environment variables, but fallback to the hardcoded values so the app works immediately.
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://wzfwgsrtnoyzcqznbovi.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6Zndnc3J0bm95emNxem5ib3ZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTU5MzUsImV4cCI6MjA3OTQ5MTkzNX0.KyuCNt4RJfHGfXoQ4Mc83a_5JQxtRbaJ10sW6NZ6c8E';

export const supabase = createClient(supabaseUrl, supabaseKey);