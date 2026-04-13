"use server";

import { revalidatePath } from "next/cache";
import { adminEnvConfigured, getAdminUser } from "@/lib/admin";
import {
  createAdminClient,
  PRODUCT_IMAGES_BUCKET,
} from "@/lib/supabase/admin";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type HeroActionResult =
  | { ok: true }
  | { ok: false; error: string };

function storagePathFromPublicUrl(publicUrl: string, bucket: string): string | null {
  const needle = `/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(needle);
  if (idx === -1) return null;
  return decodeURIComponent(publicUrl.slice(idx + needle.length));
}

async function uploadHeroImage(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Изображение баннера должно быть не больше 8 МБ.");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Только изображения: JPEG, PNG, WebP, GIF.");
  }

  const rawExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const ext = ["jpg", "jpeg", "png", "webp", "gif"].includes(rawExt)
    ? rawExt
    : "jpg";

  const path = `hero/${crypto.randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const admin = createAdminClient();
  const { error } = await admin.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, buf, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = admin.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function removeImageFromStorage(publicUrl: string) {
  const path = storagePathFromPublicUrl(publicUrl, PRODUCT_IMAGES_BUCKET);
  if (!path) return;
  const admin = createAdminClient();
  await admin.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
}

export async function updateHeroSettings(
  formData: FormData
): Promise<HeroActionResult> {
  if (!(await getAdminUser()) || !adminEnvConfigured()) {
    return { ok: false, error: "Нет доступа." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const ctaLabel = String(formData.get("cta_label") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const imageAlt = String(formData.get("image_alt") ?? "").trim();
  const imageFile = formData.get("image_file");

  if (!title) return { ok: false, error: "Введите заголовок баннера." };
  if (!subtitle) return { ok: false, error: "Введите описание баннера." };
  if (!ctaLabel) return { ok: false, error: "Введите текст кнопки." };

  const admin = createAdminClient();
  const { data: prev } = await admin
    .from("site_settings")
    .select("hero_image_url")
    .eq("id", 1)
    .maybeSingle();

  let uploadedImageUrl: string | null = null;
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      uploadedImageUrl = await uploadHeroImage(imageFile);
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Ошибка загрузки изображения.",
      };
    }
  }

  const finalImageUrl =
    uploadedImageUrl || imageUrl || String(prev?.hero_image_url ?? "").trim();
  if (!finalImageUrl) {
    return { ok: false, error: "Добавьте URL или загрузите изображение баннера." };
  }

  const { error } = await admin.from("site_settings").upsert(
    {
      id: 1,
      hero_title: title,
      hero_subtitle: subtitle,
      hero_cta_label: ctaLabel,
      hero_image_url: finalImageUrl,
      hero_image_alt: imageAlt || "Hero image",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) return { ok: false, error: error.message };

  const prevImageUrl = String(prev?.hero_image_url ?? "").trim();
  if (
    uploadedImageUrl &&
    prevImageUrl &&
    prevImageUrl !== uploadedImageUrl
  ) {
    await removeImageFromStorage(prevImageUrl);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/hero");
  return { ok: true };
}
