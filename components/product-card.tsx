"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon, Add01Icon } from "@hugeicons/core-free-icons";
import { useCart, useFavorites } from "@/lib/store";
import { formatTenge } from "@/lib/format-currency";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Props = {
  product: Product;
  imageLoading?: "lazy" | "eager";
};

export default function ProductCard({
  product,
  imageLoading = "lazy",
}: Props) {
  const addItem = useCart((s) => s.addItem);
  const qtyInCart = useCart(
    (s) => s.items.find((i) => i.id === product.id)?.quantity ?? 0
  );
  const addFavorite = useFavorites((s) => s.addItem);
  const removeFavorite = useFavorites((s) => s.removeItem);
  const isFavorite = useFavorites((s) => s.isFavorite(product.id));
  const [justAdded, setJustAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images?.[0] ?? null,
    });
    setJustAdded(true);
    toast(`${product.name} добавлен в корзину.`, { duration: 2000 });
  }

  useEffect(() => {
    if (!justAdded) return;
    const t = window.setTimeout(() => setJustAdded(false), 600);
    return () => window.clearTimeout(t);
  }, [justAdded]);

  return (
    <Link href={`/products/${product.slug}`} className="group bg-white block">
      <div className="relative aspect-3/4 bg-zinc-100 overflow-hidden">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt=""
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover"
            loading={imageLoading}
            fetchPriority={imageLoading === "eager" ? "high" : "auto"}
            placeholder="empty"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-300">
            <svg
              className="w-10 h-10"
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

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.compare_price && (
            <Badge variant="outline">Скидка</Badge>
          )}
          {product.badges && product.badges.length > 0 && (
            product.badges.map((badge, idx) => (
              <Badge key={idx} variant="outline">{badge}</Badge>
            ))
          )}
        </div>

        <button
          onClick={handleAdd}
          className={`absolute bottom-3 left-3 right-3 text-[11px] uppercase tracking-widest py-2.5 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 rounded ${
            justAdded
              ? "bg-emerald-700 text-white opacity-100 translate-y-0 scale-[1.03]"
              : qtyInCart > 0
                ? "bg-emerald-800 text-white opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-emerald-700"
                : "bg-zinc-900 text-white opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-zinc-700"
          }`}
        >
          {qtyInCart === 0 && (
            <HugeiconsIcon
              icon={Add01Icon}
              size={14}
              color="currentColor"
              strokeWidth={2}
              className={`transition-transform duration-300 ${justAdded ? "scale-125 -rotate-6" : "scale-100 rotate-0"}`}
            />
          )}
          <span className="transition-all duration-300">
            {qtyInCart > 0 ? "В корзине" : "В корзину"}
          </span>
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            if (isFavorite) {
              removeFavorite(product.id);
            } else {
              addFavorite(product);
              toast(`${product.name} добавлен в избранное.`, { duration: 2000 });
            }
          }}
          className="absolute cursor-pointer top-3 right-3 p-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-90 shadow-sm"
        >
          <div className={`transition-transform duration-300 ease-out ${isFavorite ? "scale-125" : "scale-100"}`}>
            <HugeiconsIcon
              icon={FavouriteIcon}
              size={16}
              color={isFavorite ? "#f43f5e" : "#a1a1aa"}
              fill={isFavorite ? "#f43f5e" : "transparent"}
              strokeWidth={1.5}
            />
          </div>
        </button>
      </div>

      <div className="p-3">
        <p className="text-sm text-zinc-800 leading-snug">{product.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium">{formatTenge(product.price)}</span>
          {product.compare_price != null && (
            <span className="text-xs text-zinc-400 line-through">
              {formatTenge(product.compare_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
