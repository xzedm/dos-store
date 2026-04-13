import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { Button } from "@/components/ui/button";

export default async function AdminForbiddenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=" + encodeURIComponent("/admin"));
  }
  if (isAdminEmail(user.email)) {
    redirect("/admin");
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center">
      <h1 className="font-serif text-2xl text-zinc-900 mb-2">Нет доступа</h1>
      <p className="text-sm text-zinc-500 mb-8">
        Эта область только для администраторов. Добавьте ваш email в{" "}
        <code className="text-xs bg-zinc-100 px-1 rounded">ADMIN_EMAILS</code>{" "}
        в настройках сервера.
      </p>
      <Button asChild variant="outline">
        <Link href="/">На главную</Link>
      </Button>
    </div>
  );
}
