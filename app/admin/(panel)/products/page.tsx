import Link from "next/link";
import { formatTenge } from "@/lib/format-currency";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";
import { DeleteProductButton } from "./delete-product-button";

export default async function AdminProductsPage() {
  const admin = createAdminClient();
  const { data: products, error } = await admin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <p className="text-sm text-red-600">
        Ошибка загрузки: {error.message}
      </p>
    );
  }

  const list = (products ?? []) as Product[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-2xl text-zinc-900">Товары</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Редактирование, фото и цены
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">Добавить товар</Link>
        </Button>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-zinc-500">Пока нет товаров в базе.</p>
      ) : (
        <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-[10px] uppercase tracking-widest text-zinc-400">
                <th className="px-4 py-3 font-medium w-14" />
                <th className="px-4 py-3 font-medium">Название</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium text-right">Цена</th>
                <th className="px-4 py-3 font-medium text-right">Остаток</th>
                <th className="px-4 py-3 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const thumb = p.images?.[0];
                return (
                  <tr
                    key={p.id}
                    className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50"
                  >
                    <td className="px-4 py-2">
                      <div className="h-10 w-10 rounded border border-zinc-100 bg-zinc-100 overflow-hidden">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumb}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-zinc-800">{p.name}</td>
                    <td className="px-4 py-2 font-mono text-xs text-zinc-500">
                      {p.slug}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {formatTenge(p.price)}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {p.stock}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/products/${p.id}/edit`}>
                            Изменить
                          </Link>
                        </Button>
                        <DeleteProductButton id={p.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
