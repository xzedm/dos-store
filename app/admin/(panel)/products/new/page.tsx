import Link from "next/link";
import { ProductForm } from "../product-form";

export default function NewProductPage() {
  return (
    <div>
      <Link
        href="/admin/products"
        className="text-xs text-zinc-500 hover:text-zinc-900 mb-6 inline-block"
      >
        ← К списку товаров
      </Link>
      <h1 className="font-serif text-2xl text-zinc-900 mb-8">Новый товар</h1>
      <ProductForm mode="create" />
    </div>
  );
}
