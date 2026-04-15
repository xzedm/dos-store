import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/product-card'
import HeroBanner from '@/components/hero-banner'
import ImageMarquee from '@/components/image-marquee'
import { defaultHeroSettings, normalizeHeroSettings } from '@/lib/hero-settings'
import { Product } from '@/types'

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const query = typeof params.q === 'string' ? params.q : ''

  let dbQuery = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`)
  }

  const heroQuery = supabase
    .from('site_settings')
    .select(
      'hero_title, hero_subtitle, hero_cta_label, hero_image_url, hero_image_alt'
    )
    .eq('id', 1)
    .maybeSingle()

  const [{ data: heroData }, { data: products }] = await Promise.all([
    heroQuery,
    dbQuery,
  ])
  const heroSettings = normalizeHeroSettings(
    heroData
      ? {
          title: heroData.hero_title,
          subtitle: heroData.hero_subtitle,
          ctaLabel: heroData.hero_cta_label,
          imageUrl: heroData.hero_image_url,
          imageAlt: heroData.hero_image_alt,
        }
      : defaultHeroSettings
  )
  const marqueeImages =
    products
      ?.flatMap((product: Product) => product.images?.[0] ?? [])
      .filter((imageUrl, index, array) => array.indexOf(imageUrl) === index)
      .slice(0, 8) ?? []

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* hero */}
      {!query && <HeroBanner settings={heroSettings} />}

      {!query && marqueeImages.length > 0 && (
        <div className="mb-16">
          <ImageMarquee images={marqueeImages} speed={28} />
        </div>
      )}

      <h2 id="catalog" className="text-[10px] uppercase tracking-widest text-zinc-400 mb-6 scroll-mt-24">
        {query ? `Результаты поиска: ${query}` : "Все товары"}
      </h2>

      {/* product grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-zinc-100 border border-zinc-100">
          {products.map((product: Product, index: number) => (
            <ProductCard
              key={product.id}
              product={product}
              imageLoading={index < 2 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-zinc-400 text-sm">
          Товары не найдены.
        </div>
      )}
    </div>
  )
}