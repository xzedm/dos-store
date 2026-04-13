"use client";

import { useEffect, useState } from "react";
import { useCart, useFavorites } from "@/lib/store";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { formatTenge } from "@/lib/format-currency";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, FavouriteIcon, Remove01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

export default function ProductDetailClient({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const removeItem = useCart((s) => s.removeItem);
  const updateQty = useCart((s) => s.updateQty);
  const qty = useCart((s) => s.items.find((i) => i.id === product.id)?.quantity ?? 0);
  const addFavorite = useFavorites((s) => s.addItem);
  const removeFavorite = useFavorites((s) => s.removeItem);
  const isFavorite = useFavorites((s) => s.isFavorite(product.id));
  const [bump, setBump] = useState(false);

  function addToBag() {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? null,
    });
    setBump(true);
    toast(`${product.name} добавлен в корзину.`, { duration: 2000 });
  }

  function increaseQty() {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? null,
    });
    setBump(true);
  }

  function decreaseQty() {
    if (qty <= 1) {
      removeItem(product.id);
      return;
    }
    updateQty(product.id, qty - 1);
  }

  useEffect(() => {
    if (!bump) return;
    const t = window.setTimeout(() => setBump(false), 220);
    return () => window.clearTimeout(t);
  }, [bump]);

  function toggleFavorite() {
    if (isFavorite) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
      toast(`${product.name} добавлен в избранное.`, { duration: 2000 });
    }
  }

  const displayQty = qty > 0 ? qty : 1;
  const totalPrice = product.price * displayQty;
  const totalComparePrice =
    product.compare_price != null ? product.compare_price * displayQty : null;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-3">
        {qty > 0 ? (
          <div
            className={`inline-flex items-center overflow-hidden rounded-md border border-zinc-200 bg-white transition-transform duration-200 ${bump ? "scale-[1.03]" : "scale-100"}`}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={decreaseQty}
              className="h-7 rounded-none border-0 border-r border-zinc-200 active:translate-y-0"
              aria-label="Уменьшить количество"
            >
              <HugeiconsIcon icon={Remove01Icon} size={14} />
            </Button>
            <span className="min-w-9 px-2 text-center text-sm tabular-nums">{qty}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={increaseQty}
              className="h-7 rounded-none border-0 border-l border-zinc-200 active:translate-y-0"
              aria-label="Увеличить количество"
            >
              <HugeiconsIcon icon={Add01Icon} size={14} />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            onClick={addToBag}
            className={`transition-transform duration-200 ${bump ? "scale-[1.03]" : "scale-100"}`}
          >
            В корзину
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={toggleFavorite}
          className="inline-flex items-center gap-2"
        >
          <div
            className={`transition-transform duration-300 ease-out ${isFavorite ? "scale-110" : "scale-100"}`}
          >
            <HugeiconsIcon
              icon={FavouriteIcon}
              size={16}
              color={isFavorite ? "#f43f5e" : "#a1a1aa"}
              fill={isFavorite ? "#f43f5e" : "transparent"}
              strokeWidth={1.5}
            />
          </div>
          {isFavorite ? "В избранном" : "В избранное"}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-lg font-medium">{formatTenge(totalPrice)}</span>
        {totalComparePrice != null && (
          <span className="text-sm text-zinc-400 line-through">
            {formatTenge(totalComparePrice)}
          </span>
        )}
      </div>
    </div>
  );
}
