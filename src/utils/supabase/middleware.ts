import { createServerClient, type CookieOptions } from "@supabase/ssr";

declare const process: any;

const supabaseUrl = 
  (typeof process !== 'undefined' && (process?.env?.NEXT_PUBLIC_SUPABASE_URL || process?.env?.SUPABASE_URL)) ||
  "https://ugnltqzfnsuqtomlpbvr.supabase.co";
const supabaseKey = 
  (typeof process !== 'undefined' && (process?.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process?.env?.SUPABASE_KEY)) ||
  "sb_publishable_EnUQCCveqjKLHbackOPklw_1HBKJzq6";

export const createClient = (requestContext?: any) => {
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          if (requestContext?.cookies?.getAll) {
            return requestContext.cookies.getAll();
          }
          return [];
        },
        setAll(cookiesToSet) {
          if (requestContext?.cookies?.set) {
            cookiesToSet.forEach(({ name, value, options }: any) => 
              requestContext.cookies.set(name, value, options)
            );
          }
        }
      }
    }
  );
};
