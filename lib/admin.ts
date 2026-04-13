import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function adminEmailSet(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return adminEmailSet().has(email.trim().toLowerCase());
}

/** Logged-in user who is listed in ADMIN_EMAILS / ADMIN_EMAIL. */
export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !isAdminEmail(user.email)) return null;
  return user;
}

/** Redirects to login or forbidden if the visitor is not an admin. */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login?redirectTo=" + encodeURIComponent("/admin"));
  }
  if (!isAdminEmail(user.email)) {
    redirect("/admin/forbidden");
  }
  return user;
}

export function adminEnvConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
