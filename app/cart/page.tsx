"use client";

import Image from "next/image";
import Link from "next/link";
import { formatTenge } from "@/lib/format-currency";
import { useCart } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Remove01Icon } from "@hugeicons/core-free-icons";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.total());
  const removeItem = useCart((s) => s.removeItem);
  const updateQty = useCart((s) => s.updateQty);

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
      <h1 className="font-serif text-2xl text-zinc-900 mb-8">Корзина</h1>
      <ul className="space-y-4 mb-8">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-4"
          >
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="h-16 w-16 shrink-0 rounded-md border border-zinc-100 bg-zinc-100 overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                    sizes="64px"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    placeholder="empty"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-zinc-300">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1}
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <Link
                  href={item.slug ? `/products/${item.slug}` : "/"}
                  className="text-sm text-zinc-800 hover:underline"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {formatTenge(item.price)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (item.quantity > 1) updateQty(item.id, item.quantity - 1);
                  }}
                  className="h-7 w-7 p-0"
                >
                  <HugeiconsIcon icon={Remove01Icon} size={12} />
                </Button>
                <span className="text-xs w-8 text-center">{item.quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateQty(item.id, item.quantity + 1)}
                  className="h-7 w-7 p-0"
                >
                  <HugeiconsIcon icon={Add01Icon} size={12} />
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => removeItem(item.id)}
              >
                Удалить
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-between text-sm font-medium mb-8">
        <span>Сумма</span>
        <span className="tabular-nums">{formatTenge(subtotal)}</span>
      </div>
      <Button asChild className="w-full sm:w-auto">
        <Link href="/checkout">К оформлению</Link>
      </Button>
    </div>
  );
}
