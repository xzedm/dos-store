import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatTenge } from "@/lib/format-currency";
import type { Order } from "@/types";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "./sign-out-button";

function statusLabel(status: Order["status"]) {
  switch (status) {
    case "pending":
      return "В обработке";
    case "paid":
      return "Оплачен";
    case "shipped":
      return "В пути";
    case "delivered":
      return "Доставлен";
    case "cancelled":
      return "Отменен";
    default:
      return status;
  }
}

function statusVariant(status: Order["status"]): "outline" | "default" | "secondary" | "destructive" {
  switch (status) {
    case "delivered":
      return "default";
    case "paid":
    case "shipped":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select("id,status,total,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(6);

  const orders = (ordersData ?? []) as Pick<
    Order,
    "id" | "status" | "total" | "created_at"
  >[];
  const paidOrders = orders.filter((order) => order.status !== "cancelled").length;
  const spentTotal = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);
  const hasOrdersAccess = !ordersError;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <header>
        <h1 className="font-serif text-2xl text-zinc-900 mb-2">Ваш профиль</h1>
        <p className="text-sm text-zinc-500">
          История заказов, быстрые действия и данные аккаунта в одном месте.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-zinc-200 bg-white p-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">
            Всего заказов
          </p>
          <p className="text-xl font-medium text-zinc-900 tabular-nums">{orders.length}</p>
        </div>
        <div className="rounded-md border border-zinc-200 bg-white p-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">
            Успешных
          </p>
          <p className="text-xl font-medium text-zinc-900 tabular-nums">{paidOrders}</p>
        </div>
        <div className="rounded-md border border-zinc-200 bg-white p-4">
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">
            Сумма покупок
          </p>
          <p className="text-xl font-medium text-zinc-900 tabular-nums">
            {formatTenge(spentTotal)}
          </p>
        </div>
      </section>

      <section className="rounded-md border border-zinc-200 bg-white p-6">
        <h2 className="font-serif text-lg text-zinc-900 mb-4">Мои заказы</h2>
        {!hasOrdersAccess ? (
          <p className="text-sm text-zinc-500">
            У вас нет заказов.
          </p>
        ) : orders.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-zinc-500">У вас пока нет заказов.</p>
            <Link
              href="/"
              className="inline-flex h-7 items-center rounded-md border border-border px-2 text-xs font-medium hover:bg-muted/50"
            >
              Перейти к покупкам
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {orders.map((order) => (
              <li key={order.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-zinc-800 truncate">Заказ #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-zinc-500">
                    {new Date(order.created_at).toLocaleDateString("ru-RU", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <Badge variant={statusVariant(order.status)}>{statusLabel(order.status)}</Badge>
                  <p className="text-sm font-medium text-zinc-900 tabular-nums">
                    {formatTenge(order.total)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-md border border-zinc-200 bg-white p-6 space-y-4">
        <h2 className="font-serif text-lg text-zinc-900">Аккаунт</h2>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">Эл. почта</p>
          <p className="text-sm text-zinc-800">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/favorites"
            className="inline-flex h-7 items-center rounded-md border border-border px-2 text-xs font-medium hover:bg-muted/50"
          >
            Избранное
          </Link>
          <Link
            href="/cart"
            className="inline-flex h-7 items-center rounded-md border border-border px-2 text-xs font-medium hover:bg-muted/50"
          >
            Корзина
          </Link>
          <Link
            href="/"
            className="inline-flex h-7 items-center rounded-md border border-border px-2 text-xs font-medium hover:bg-muted/50"
          >
            Продолжить покупки
          </Link>
          <SignOutButton />
        </div>
      </section>
    </div>
  );
}
