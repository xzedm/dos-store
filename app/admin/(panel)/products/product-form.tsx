"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/types";
import {
  createProduct,
  updateProduct,
  type ActionResult,
} from "./actions";

type Props = {
  mode: "create" | "edit";
  product?: Product;
};

function numForInput(n: number | string | null | undefined): string {
  if (n == null || n === "") return "";
  return typeof n === "number" ? String(n) : String(n);
}

export function ProductForm({ mode, product }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [existingImages, setExistingImages] = useState<string[]>(
    () => product?.images?.filter(Boolean) ?? []
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("existing_images", JSON.stringify(existingImages));

    startTransition(async () => {
      let r: ActionResult;
      if (mode === "create") {
        r = await createProduct(fd);
      } else if (product) {
        r = await updateProduct(product.id, fd);
      } else {
        r = { ok: false, error: "Нет данных товара." };
      }
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(mode === "create" ? "Товар создан" : "Сохранено");
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="space-y-1.5">
        <Label htmlFor="name">Название</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={product?.name ?? ""}
          placeholder="Например: Льняное платье"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          name="slug"
          required
          defaultValue={product?.slug ?? ""}
          placeholder="linen-dress"
          className="font-mono text-xs"
        />
        <p className="text-[10px] text-zinc-400">
          Только латиница в нижнем регистре, цифры и дефисы. Откроется как{" "}
          <span className="font-mono">/products/slug</span>
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Описание</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={product?.description ?? ""}
          placeholder="Текст на странице товара"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="price">Цена (₸, тенге)</Label>
          <Input
            id="price"
            name="price"
            type="text"
            inputMode="decimal"
            required
            defaultValue={numForInput(product?.price)}
            placeholder="15 000"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="compare_price">Старая цена (необязательно)</Label>
          <Input
            id="compare_price"
            name="compare_price"
            type="text"
            inputMode="decimal"
            defaultValue={numForInput(product?.compare_price)}
            placeholder="18 000"
          />
        </div>
      </div>

      <div className="space-y-1.5 max-w-xs">
        <Label htmlFor="stock">Остаток на складе</Label>
        <Input
          id="stock"
          name="stock"
          type="text"
          inputMode="numeric"
          defaultValue={numForInput(product?.stock ?? 0)}
          placeholder="0"
        />
      </div>

      <div className="space-y-2">
        <Label>Фотографии</Label>
        {existingImages.length > 0 && (
          <ul className="flex flex-wrap gap-2 mb-2">
            {existingImages.map((url) => (
              <li
                key={url}
                className="relative h-16 w-16 rounded border border-zinc-200 overflow-hidden group shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setExistingImages((prev) => prev.filter((u) => u !== url))
                  }
                  className="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Убрать
                </button>
              </li>
            ))}
          </ul>
        )}
        <Input
          id="new_images"
          name="new_images"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="cursor-pointer text-xs"
        />
        <p className="text-[10px] text-zinc-400">
          JPEG, PNG, WebP или GIF, до 5 МБ каждый. Можно выбрать несколько.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Сохранение…"
            : mode === "create"
              ? "Создать товар"
              : "Сохранить"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => router.push("/admin/products")}
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}
