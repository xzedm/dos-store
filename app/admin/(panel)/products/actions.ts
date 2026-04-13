"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser, adminEnvConfigured } from "@/lib/admin";
import {
  createAdminClient,
  PRODUCT_IMAGES_BUCKET,
} from "@/lib/supabase/admin";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function storagePathFromPublicUrl(
  publicUrl: string,
  bucket: string
): string | null {
  const needle = `/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(needle);
  if (idx === -1) return null;
  return decodeURIComponent(publicUrl.slice(idx + needle.length));
}

async function uploadNewImages(files: File[]): Promise<string[]> {
  const admin = createAdminClient();
  const urls: string[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    if (file.size > MAX_FILE_BYTES) {
      throw new Error("Каждый файл не больше 5 МБ.");
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      throw new Error("Только изображения: JPEG, PNG, WebP, GIF.");
    }
    const rawExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const ext = ["jpg", "jpeg", "png", "webp", "gif"].includes(rawExt)
      ? rawExt
      : "jpg";
    const path = `products/${crypto.randomUUID()}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const { error } = await admin.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, buf, {
        contentType: file.type,
        upsert: false,
      });
    if (error) throw new Error(error.message);
    const { data } = admin.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

async function removeImagesFromStorage(urls: string[]) {
  const admin = createAdminClient();
  const paths = urls
    .map((u) => storagePathFromPublicUrl(u, PRODUCT_IMAGES_BUCKET))
    .filter((p): p is string => Boolean(p));
  if (paths.length === 0) return;
  await admin.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
}

function parseNum(raw: FormDataEntryValue | null): number | null {
  if (raw == null || raw === "") return null;
  const s = String(raw).trim().replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createProduct(formData: FormData): Promise<ActionResult> {
  if (!(await getAdminUser()) || !adminEnvConfigured()) {
    return { ok: false, error: "Нет доступа." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const description = descriptionRaw === "" ? null : descriptionRaw;
  const price = parseNum(formData.get("price"));
  const comparePrice = parseNum(formData.get("compare_price"));
  const stockRaw = parseNum(formData.get("stock"));

  if (!name) return { ok: false, error: "Укажите название." };
  if (!SLUG_RE.test(slug)) {
    return {
      ok: false,
      error: "Артикул в URL (slug): только латиница, цифры и дефисы.",
    };
  }
  if (price == null || price <= 0) {
    return { ok: false, error: "Укажите цену больше нуля." };
  }
  const stock = stockRaw != null && stockRaw >= 0 ? Math.floor(stockRaw) : 0;

  const files = formData.getAll("new_images") as File[];
  let imageUrls: string[] = [];
  try {
    imageUrls = await uploadNewImages(files);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Ошибка загрузки файлов.",
    };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("products").insert({
    name,
    slug,
    description,
    price,
    compare_price:
      comparePrice != null && comparePrice > 0 ? comparePrice : null,
    stock,
    images: imageUrls.length > 0 ? imageUrls : null,
    category: null,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Такой slug уже занят. Выберите другой." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function updateProduct(
  productId: string,
  formData: FormData
): Promise<ActionResult> {
  if (!(await getAdminUser()) || !adminEnvConfigured()) {
    return { ok: false, error: "Нет доступа." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const description = descriptionRaw === "" ? null : descriptionRaw;
  const price = parseNum(formData.get("price"));
  const comparePrice = parseNum(formData.get("compare_price"));
  const stockRaw = parseNum(formData.get("stock"));

  let existing: string[] = [];
  try {
    existing = JSON.parse(
      String(formData.get("existing_images") ?? "[]")
    ) as string[];
    if (!Array.isArray(existing)) existing = [];
  } catch {
    existing = [];
  }

  if (!name) return { ok: false, error: "Укажите название." };
  if (!SLUG_RE.test(slug)) {
    return {
      ok: false,
      error: "Артикул в URL (slug): только латиница, цифры и дефисы.",
    };
  }
  if (price == null || price <= 0) {
    return { ok: false, error: "Укажите цену больше нуля." };
  }
  const stock = stockRaw != null && stockRaw >= 0 ? Math.floor(stockRaw) : 0;

  const files = formData.getAll("new_images") as File[];
  let newUrls: string[] = [];
  try {
    newUrls = await uploadNewImages(files);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Ошибка загрузки файлов.",
    };
  }

  const allImages = [...existing, ...newUrls];
  const admin = createAdminClient();

  const { data: prev } = await admin
    .from("products")
    .select("images, slug")
    .eq("id", productId)
    .maybeSingle();

  const { error } = await admin
    .from("products")
    .update({
      name,
      slug,
      description,
      price,
      compare_price:
        comparePrice != null && comparePrice > 0 ? comparePrice : null,
      stock,
      images: allImages.length > 0 ? allImages : null,
    })
    .eq("id", productId);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Такой slug уже занят." };
    }
    return { ok: false, error: error.message };
  }

  const prevUrls = (prev?.images as string[] | null) ?? [];
  const removed = prevUrls.filter((u) => !allImages.includes(u));
  if (removed.length > 0) {
    await removeImagesFromStorage(removed);
  }

  revalidatePath("/");
  revalidatePath("/admin/products");
  if (prev?.slug && prev.slug !== slug) {
    revalidatePath(`/products/${prev.slug}`);
  }
  revalidatePath(`/products/${slug}`);
  return { ok: true };
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  if (!(await getAdminUser()) || !adminEnvConfigured()) {
    return { ok: false, error: "Нет доступа." };
  }

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("products")
    .select("images, slug")
    .eq("id", productId)
    .maybeSingle();

  const { error } = await admin.from("products").delete().eq("id", productId);
  if (error) return { ok: false, error: error.message };

  const urls = (row?.images as string[] | null) ?? [];
  await removeImagesFromStorage(urls);

  revalidatePath("/");
  revalidatePath("/admin/products");
  if (row?.slug) revalidatePath(`/products/${row.slug}`);
  return { ok: true };
}
