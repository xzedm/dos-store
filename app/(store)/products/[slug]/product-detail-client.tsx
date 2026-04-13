"use client";

import { useCart, useFavorites } from "@/lib/store";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

export default function ProductDetailClient({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const addFavorite = useFavorites((s) => s.addItem);
  const removeFavorite = useFavorites((s) => s.removeItem);
  const isFavorite = useFavorites((s) => s.isFavorite(product.id));

  function addToBag() {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? null,
    });
    toast(`${product.name} добавлен в корзину.`, { duration: 2000 });
  }

  function toggleFavorite() {
    if (isFavorite) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
      toast(`${product.name} добавлен в избранное.`, { duration: 2000 });
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button type="button" onClick={addToBag}>
        В корзину
      </Button>
      <button
        onClick={toggleFavorite}
        className="p-1.5 bg-white rounded-full transition-all duration-200 hover:scale-110 active:scale-90 shadow-sm border border-zinc-200"
      >
        <div className={`transition-transform duration-300 ease-out ${isFavorite ? "scale-125" : "scale-100"}`}>
          <HugeiconsIcon
            icon={FavouriteIcon}
            size={20}
            color={isFavorite ? "#f43f5e" : "#a1a1aa"}
            fill={isFavorite ? "#f43f5e" : "transparent"}
            strokeWidth={1.5}
          />
        </div>
      </button>
    </div>
  );
}
