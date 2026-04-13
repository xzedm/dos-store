"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { HeroSettings } from "@/lib/hero-settings";
import { updateHeroSettings } from "./actions";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MIN_WIDTH = 1200;
const MIN_HEIGHT = 1200;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

type Props = {
  initial: HeroSettings;
};

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const src = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(src);
    };
    img.onerror = () => {
      reject(new Error("Не удалось прочитать размеры изображения."));
      URL.revokeObjectURL(src);
    };
    img.src = src;
  });
}

export function HeroForm({ initial }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const imageFile = fd.get("image_file");

    if (imageFile instanceof File && imageFile.size > 0) {
      if (imageFile.size > MAX_FILE_BYTES) {
        toast.error("Изображение баннера должно быть не больше 8 МБ.");
        return;
      }
      if (!ALLOWED_TYPES.has(imageFile.type)) {
        toast.error("Поддерживаются только JPEG, PNG, WebP или GIF.");
        return;
      }
      try {
        const { width, height } = await getImageDimensions(imageFile);
        if (width < MIN_WIDTH || height < MIN_HEIGHT) {
          toast.error(
            `Минимальный размер изображения: ${MIN_WIDTH}x${MIN_HEIGHT}px.`
          );
          return;
        }
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Не удалось проверить размер изображения."
        );
        return;
      }
    }

    startTransition(async () => {
      const result = await updateHeroSettings(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Баннер обновлен");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-1.5">
        <Label htmlFor="title">Заголовок</Label>
        <Textarea
          id="title"
          name="title"
          rows={3}
          defaultValue={initial.title}
          placeholder={"Абсолютный\nминимум."}
          required
        />
        <p className="text-[10px] text-zinc-400">
          Каждая новая строка будет перенесена в заголовке.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subtitle">Подзаголовок</Label>
        <Textarea
          id="subtitle"
          name="subtitle"
          rows={4}
          defaultValue={initial.subtitle}
          placeholder="Описание баннера на главной"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cta_label">Текст кнопки</Label>
          <Input
            id="cta_label"
            name="cta_label"
            defaultValue={initial.ctaLabel}
            placeholder="В каталог"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="image_alt">Alt текст изображения</Label>
          <Input
            id="image_alt"
            name="image_alt"
            defaultValue={initial.imageAlt}
            placeholder="Minimalist fashion"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="image_url">URL изображения</Label>
        <Input
          id="image_url"
          name="image_url"
          type="url"
          defaultValue={initial.imageUrl}
          placeholder="https://..."
        />
        <p className="text-[10px] text-zinc-400">
          Можно оставить URL или загрузить файл ниже с компьютера.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="image_file">Загрузить новое изображение</Label>
        <Input
          id="image_file"
          name="image_file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="cursor-pointer text-xs"
        />
        <p className="text-[10px] text-zinc-400">
          JPEG, PNG, WebP или GIF. Максимум 8 МБ, минимум {MIN_WIDTH}x{MIN_HEIGHT}px.
        </p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Сохранение..." : "Сохранить баннер"}
        </Button>
      </div>
    </form>
  );
}
