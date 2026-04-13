import { createClient } from "@supabase/supabase-js";

/** Service-role client for admin-only server code. Never import in client components. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for admin operations."
    );
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/** Storage bucket for product images. Override if yours has another name (e.g. `media`). */
export const PRODUCT_IMAGES_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET?.trim() || "product-images";
