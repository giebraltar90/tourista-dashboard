
// Configuration constants for Supabase client
export const FETCH_TIMEOUT = 60000; // 60 seconds timeout for slow connections
export const MAX_RETRIES = 5; // Increase maximum number of retries
export const CACHE_TTL = 60000; // 60 seconds cache timeout
export const API_BASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hznwikjmwmskvoqgkvjk.supabase.co';
export const API_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6bndpa2ptd21za3ZvcWdrdmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzOTg5MDgsImV4cCI6MjA1Nzk3NDkwOH0.P887Dped-kI5F4v8PNeIsA0gWHslZ8-YGeI4mBfecJY';
