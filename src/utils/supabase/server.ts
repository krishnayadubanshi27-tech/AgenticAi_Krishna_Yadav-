import { createServerClient, type CookieOptions } from "@supabase/ssr";

declare const process: any;

const supabaseUrl = 
  (typeof process !== 'undefined' && (process?.env?.NEXT_PUBLIC_SUPABASE_URL || process?.env?.SUPABASE_URL)) ||
  "https://ugnltqzfnsuqtomlpbvr.supabase.co";
const supabaseKey = 
  (typeof process !== 'undefined' && (process?.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process?.env?.SUPABASE_KEY)) ||
  "sb_publishable_EnUQCCveqjKLHbackOPklw_1HBKJzq6";

export interface SimpleCookieStore {
  getAll?: () => { name: string; value: string }[] | Record<string, string>;
  get?: (name: string) => { value: string } | undefined;
  set?: (name: string, value: string, options?: CookieOptions) => void;
  setAll?: (cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) => void;
}

export const createClient = (cookieStore?: SimpleCookieStore) => {
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          if (!cookieStore || !cookieStore.getAll) return [];
          const all = cookieStore.getAll();
          if (Array.isArray(all)) return all;
          return Object.entries(all).map(([name, value]) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          try {
            if (cookieStore?.setAll) {
              cookieStore.setAll(cookiesToSet);
            } else if (cookieStore?.set) {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set!(name, value, options));
            }
          } catch {
            // Ignored if called from read-only server component
          }
        },
      },
    }
  );
};
