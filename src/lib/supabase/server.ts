import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env, isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/env";

export async function createServerSupabaseClient() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl!, env.supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server components cannot always write cookies during render.
        }
      },
    },
  });
}

export function createServiceSupabaseClient(): SupabaseClient {
  if (!isSupabaseAdminConfigured) {
    throw new Error("Supabase service role is not configured.");
  }

  return createClient(env.supabaseUrl!, env.supabaseServiceRoleKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
