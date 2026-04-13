"use client";

import Link from "next/link";
import { useFavorites } from "@/lib/store";
import ProductCard from "@/components/product-card";

export default function FavoritesPage() {
  const items = useFavorites((s) => s.items);

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col items-center text-center">
        <h1 className="font-serif text-3xl text-zinc-900 mb-4">Избранное</h1>
        <p className="text-zinc-500 mb-8 max-w-sm">
          Ваш список избранного пуст. Добавьте сюда товары, которые вам понравились.
        </p>
        <Link
          href="/"
          className="bg-zinc-900 rounded text-white text-xs uppercase tracking-widest px-8 py-3 hover:bg-zinc-800 transition-colors"
        >
          Вернуться в магазин
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="font-serif text-3xl text-zinc-900 mb-2">Избранное</h1>
      <p className="text-sm text-zinc-500 mb-10">
        У вас {items.length} {items.length === 1 ? "товар" : items.length > 1 && items.length < 5 ? "товара" : "товаров"} в избранном
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
