// ============================================
// Supabase Configuration — Admin only
// persistSession: true para manter login do admin
// ============================================

const SUPABASE_URL = 'https://wejrqqqblubxlwmztzmt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_5EfIR3pVCfsAaASaZlbaTA_bKQJOiDo';

window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true }
});
