import { createBrowserClient } from "@supabase/ssr";

declare const process: any;

// Supabase Connection Credentials
const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process?.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  "https://ugnltqzfnsuqtomlpbvr.supabase.co";

const supabaseKey = 
  (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY)) ||
  (typeof process !== 'undefined' && process?.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  "sb_publishable_EnUQCCveqjKLHbackOPklw_1HBKJzq6";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey
  );

// Shared singleton browser client
export const supabase = createClient();
