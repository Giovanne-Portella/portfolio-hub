// ============================================
// Supabase Configuration
// ============================================
// Replace with your Supabase project credentials
// Found in: Supabase Dashboard > Settings > API

const SUPABASE_URL = 'https://wejrqqqblubxlwmztzmt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlanJxcXFibHVieGx3bXp0em10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzIzMTgsImV4cCI6MjA5MDY0ODMxOH0.Ylfto8T9au3Q3P_0Qs_NMX1TRDgjB6IRYmEDS1qKzo4';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
