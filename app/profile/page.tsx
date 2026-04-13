import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <h1 className="font-serif text-2xl text-zinc-900 mb-6">Ваш профиль</h1>
      <div className="rounded-md border border-zinc-200 bg-white p-6 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">
            Эл. почта
          </p>
          <p className="text-sm text-zinc-800">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <SignOutButton />
          <Link
            href="/"
            className="inline-flex h-7 items-center rounded-md border border-border px-2 text-xs font-medium hover:bg-muted/50"
          >
            Продолжить покупки
          </Link>
        </div>
      </div>
    </div>
  );
}
