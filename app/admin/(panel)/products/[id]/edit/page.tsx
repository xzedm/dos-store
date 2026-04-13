import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Product } from "@/types";
import { ProductForm } from "../../product-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !row) {
    notFound();
  }

  const product = row as Product;

  return (
    <div>
      <Link
        href="/admin/products"
        className="text-xs text-zinc-500 hover:text-zinc-900 mb-6 inline-block"
      >
        ← К списку товаров
      </Link>
      <h1 className="font-serif text-2xl text-zinc-900 mb-8">
        Редактировать: {product.name}
      </h1>
      <ProductForm mode="edit" product={product} />
    </div>
  );
}
