"use client";

import Link from "next/link";
import { formatTenge } from "@/lib/format-currency";
import { useCart } from "@/lib/store";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.total());
  const clearCart = useCart((s) => s.clearCart);

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-6 py-24 text-center">
        <p className="text-sm text-zinc-500 mb-6">Ваша корзина пуста.</p>
        <Button asChild variant="outline">
          <Link href="/">К каталогу</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <h1 className="font-serif text-2xl text-zinc-900 mb-8">Оформление заказа</h1>
      <ul className="border border-zinc-200 divide-y divide-zinc-100 rounded-md bg-white mb-6">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 px-4 py-3 text-sm">
            <span className="text-zinc-800">
              {item.name}
              <span className="text-zinc-400"> × {item.quantity}</span>
            </span>
            <span className="text-zinc-600 tabular-nums">
              {formatTenge(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between text-sm font-medium mb-8">
        <span>Итого</span>
        <span className="tabular-nums">{formatTenge(subtotal)}</span>
      </div>
      <p className="text-xs text-zinc-500 mb-4">
        Оплата пока не подключена. Очистите корзину после тестирования.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={() => clearCart()}>
          Оформить заказ (демо)
        </Button>
        <Button asChild variant="outline">
          <Link href="/">В магазин</Link>
        </Button>
      </div>
    </div>
  );
}
