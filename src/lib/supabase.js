import { createClient } from '@supabase/supabase-js';

// Safe environment variable retrieval across Vite browser and Node.js environments
const getEnvVar = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseKey = getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY') || getEnvVar('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('your-project-id')
);

// Reuse singleton instance on globalThis to prevent multiple GoTrueClient warnings during Vite HMR
const globalScope = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

if (!globalScope.__yasraf_supabase_client__) {
  globalScope.__yasraf_supabase_client__ = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseKey)
    : createClient('https://placeholder.supabase.co', 'placeholder-anon-key');
}

export const supabase = globalScope.__yasraf_supabase_client__;
export default supabase;
