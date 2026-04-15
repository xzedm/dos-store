import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client for use in Server Components / pages.
//
// Note: Next.js only allows mutating cookies in Server Actions or Route Handlers.
// The pages that use this helper are regular Server Components, so we expose a
// read-only cookie adapter here and rely on middleware for session refresh.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        // No-op in Server Components to avoid
        // "Cookies can only be modified in a Server Action or Route Handler".
        setAll: async () => {},
      },
    }
  );
}
