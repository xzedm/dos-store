"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatTenge } from "@/lib/format-currency";
import { useCart } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.total());
  const clearCart = useCart((s) => s.clearCart);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!items.length) return;

    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        address,
        items: items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      }),
    });

    const payload = (await res.json().catch(() => ({}))) as {
      error?: string;
      details?: string;
    };

    if (!res.ok) {
      if (res.status === 401 || payload.error === "AUTH_REQUIRED") {
        setSubmitting(false);
        router.push("/login?redirectTo=%2Fcheckout");
        return;
      }

      if (payload.error === "INVALID_PHONE") {
        setError("Укажите корректный номер телефона.");
      } else if (payload.error === "INVALID_ADDRESS") {
        setError("Укажите полный адрес доставки.");
      } else if (payload.error === "EMPTY_CART") {
        setError("Корзина пуста.");
      } else if (payload.details) {
        setError(payload.details);
      } else {
        setError("Не удалось оформить заказ. Попробуйте снова.");
      }
      setSubmitting(false);
      return;
    }

    clearCart();
    router.push("/profile");
    router.refresh();
  }

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

      <form onSubmit={submitOrder} className="space-y-6">
        <ul className="border border-zinc-200 divide-y divide-zinc-100 rounded-md bg-white">
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

        <div className="flex justify-between text-sm font-medium">
          <span>Итого</span>
          <span className="tabular-nums">{formatTenge(subtotal)}</span>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Телефон</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 777 123 45 67"
            autoComplete="tel"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">Адрес доставки</Label>
          <Textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Город, улица, дом, квартира"
            autoComplete="street-address"
            required
            minLength={8}
          />
        </div>

        {error && (
          <p className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Оформляем..." : "Оформить заказ"}
          </Button>
          <Button asChild variant="outline" type="button">
            <Link href="/cart">Вернуться в корзину</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
