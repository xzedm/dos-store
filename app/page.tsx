import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/product-card'
import HeroBanner from '@/components/hero-banner'
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

  const { data: products } = await dbQuery

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* hero */}
      {!query && <HeroBanner />}

      <h2 id="catalog" className="text-[10px] uppercase tracking-widest text-zinc-400 mb-6 scroll-mt-24">
        {query ? `Результаты поиска: ${query}` : "Все товары"}
      </h2>

      {/* product grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-zinc-100 border border-zinc-100">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
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