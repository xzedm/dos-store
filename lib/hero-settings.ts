export type HeroSettings = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  imageUrl: string;
  imageAlt: string;
};

export const defaultHeroSettings: HeroSettings = {
  title: "Абсолютный\nминимум.",
  subtitle:
    "Чистые линии, нейтральные оттенки и премиальные материалы. Откройте для себя эстетику повседневности.",
  ctaLabel: "В каталог",
  imageUrl:
    "https://images.unsplash.com/photo-1434389678243-7ef26fce43ee?q=80&w=2000&auto=format&fit=crop",
  imageAlt: "Minimalist fashion",
};

export function normalizeHeroSettings(
  raw: Partial<HeroSettings> | null | undefined
): HeroSettings {
  return {
    title: raw?.title?.trim() || defaultHeroSettings.title,
    subtitle: raw?.subtitle?.trim() || defaultHeroSettings.subtitle,
    ctaLabel: raw?.ctaLabel?.trim() || defaultHeroSettings.ctaLabel,
    imageUrl: raw?.imageUrl?.trim() || defaultHeroSettings.imageUrl,
    imageAlt: raw?.imageAlt?.trim() || defaultHeroSettings.imageAlt,
  };
}
