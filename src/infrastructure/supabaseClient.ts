import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ndpfcmvqgvrllisfkzsy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kcGZjbXZxZ3ZybGxpc2ZrenN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNTE2OTEsImV4cCI6MjA4NTgyNzY5MX0.98N1lYyJ1QJkQOS-3f298oYydVIqrq3u9SqnqLpaapQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
