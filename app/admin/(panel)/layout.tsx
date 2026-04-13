import Link from "next/link";
import { requireAdmin, adminEnvConfigured } from "@/lib/admin";
import { Button } from "@/components/ui/button";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  if (!adminEnvConfigured()) {
    return (
      <div className="max-w-lg mx-auto px-6 py-16">
        <h1 className="font-serif text-xl text-zinc-900 mb-2">Настройка админки</h1>
        <p className="text-sm text-zinc-600 leading-relaxed mb-4">
          Добавьте в <code className="text-xs bg-zinc-100 px-1 rounded">.env.local</code>{" "}
          сервисный ключ Supabase (только на сервере, не публикуйте его):
        </p>
        <pre className="text-xs bg-zinc-100 p-3 rounded-md overflow-x-auto mb-4">
          SUPABASE_SERVICE_ROLE_KEY=your_service_role_key{"\n"}
          ADMIN_EMAILS=you@example.com{"\n"}
          SUPABASE_STORAGE_BUCKET=media
        </pre>
        <p className="text-xs text-zinc-500">
          Ключ: Project Settings → API → service_role. В Storage нужен публичный бакет;
          имя по умолчанию в коде —{" "}
          <code className="bg-zinc-100 px-1 rounded">product-images</code>, иначе
          задайте <code className="bg-zinc-100 px-1 rounded">SUPABASE_STORAGE_BUCKET</code>{" "}
          (например <code className="bg-zinc-100 px-1 rounded">media</code>).
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/">На главную</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 border-t border-zinc-100">
      <header className="bg-white border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-6 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-sm font-medium text-zinc-900">
              Админка
            </Link>
            <Link
              href="/admin/products"
              className="text-xs text-zinc-500 hover:text-zinc-900"
            >
              Товары
            </Link>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-zinc-500">
            <Link href="/">В магазин</Link>
          </Button>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
