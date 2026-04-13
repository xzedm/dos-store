import { createAdminClient } from "@/lib/supabase/admin";
import {
  defaultHeroSettings,
  normalizeHeroSettings,
  type HeroSettings,
} from "@/lib/hero-settings";
import { HeroForm } from "./hero-form";

export default async function AdminHeroPage() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("site_settings")
    .select(
      "hero_title, hero_subtitle, hero_cta_label, hero_image_url, hero_image_alt"
    )
    .eq("id", 1)
    .maybeSingle();

  const initial: HeroSettings = normalizeHeroSettings(
    error || !data
      ? defaultHeroSettings
      : {
          title: data.hero_title,
          subtitle: data.hero_subtitle,
          ctaLabel: data.hero_cta_label,
          imageUrl: data.hero_image_url,
          imageAlt: data.hero_image_alt,
        }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-zinc-900">Hero баннер</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Редактирование баннера на главной странице.
        </p>
      </div>

      {error ? (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
          Не удалось прочитать текущие настройки. Показаны значения по умолчанию.
        </p>
      ) : null}

      <HeroForm initial={initial} />
    </div>
  );
}
