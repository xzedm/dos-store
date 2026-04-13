import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatTenge } from "@/lib/format-currency";
import { Product } from "@/types";
import ProductDetailClient from "./product-detail-client";

type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !product) {
    notFound();
  }

  const p = product as Product;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link
        href="/"
        className="text-xs text-zinc-500 hover:text-zinc-900 uppercase tracking-widest mb-8 inline-block"
      >
        ← В магазин
      </Link>
      <div className="grid md:grid-cols-2 gap-10 md:gap-16">
        <div className="relative aspect-3/4 bg-zinc-100 rounded-sm border border-zinc-100 overflow-hidden flex items-center justify-center text-zinc-300">
          {p.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.images[0]}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              viewBox="0 0 24 24"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          )}
        </div>
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-zinc-900 leading-tight mb-4">
            {p.name}
          </h1>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-lg font-medium">{formatTenge(p.price)}</span>
            {p.compare_price != null && (
              <span className="text-sm text-zinc-400 line-through">
                {formatTenge(p.compare_price)}
              </span>
            )}
          </div>
          {p.description && (
            <p className="text-sm text-zinc-600 leading-relaxed mb-8 whitespace-pre-wrap">
              {p.description}
            </p>
          )}
          <ProductDetailClient product={p} />
        </div>
      </div>
    </div>
  );
}
