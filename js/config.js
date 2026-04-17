// ============================================
// Supabase Configuration
// ============================================
// Replace with your Supabase project credentials
// Found in: Supabase Dashboard > Settings > API

const SUPABASE_URL = 'https://wejrqqqblubxlwmztzmt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5EfIR3pVCfsAaASaZlbaTA_bKQJOiDo';

window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
