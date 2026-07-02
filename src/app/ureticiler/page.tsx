import Link from 'next/link'
import { BadgeCheck, MapPin, Star, TrendingUp, Trophy } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getProducts, getProviders } from '@/lib/data'
import { formatSalesTier } from '@/lib/format'
import { CATEGORY_LABELS, ROLE_LABELS } from '@/lib/labels'
import { cn } from '@/lib/utils'
import type { ProductCategory } from '@/lib/types'

export const dynamic = 'force-dynamic'

// Üstte gösterilecek perde kategorileri (istenen sırayla)
const BROWSE_CATEGORIES: ProductCategory[] = [
  'ROLLER_BLIND',
  'CELLULAR_SHADE',
  'ROMAN_SHADE',
  'CURTAIN',
  'ZEBRA_BLIND',
  'VENETIAN_BLIND',
  'WOOD_BLIND',
  'SHEER',
  'BLACKOUT',
]

export default async function UreticilerPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>
}) {
  const { kategori } = await searchParams
  const [providers, products] = await Promise.all([getProviders(), getProducts()])

  // Kategori → o kategoride ürünü olan üreticiler
  const providersByCategory = new Map<ProductCategory, Set<string>>()
  for (const product of products) {
    const set = providersByCategory.get(product.category) ?? new Set<string>()
    set.add(product.orgId)
    providersByCategory.set(product.category, set)
  }

  const selected =
    kategori && BROWSE_CATEGORIES.includes(kategori as ProductCategory)
      ? (kategori as ProductCategory)
      : null

  const visibleProviders = selected
    ? providers.filter((p) => providersByCategory.get(selected)?.has(p.id))
    : providers

  // En iyi performans: puan + satış hacmi
  const topPerformers = [...providers]
    .sort((a, b) => b.ratingAvg - a.ratingAvg || (b.salesCount ?? 0) - (a.salesCount ?? 0))
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Üreticiler</h1>
          <p className="text-sm text-muted-foreground">
            Kategori seçin, o ürünü üreten firmaları görün — veya tüm ağı inceleyin.
          </p>
        </div>

        {/* 1 — Kategoriler */}
        <section className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/ureticiler"
              className={cn(
                'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                !selected
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              Tümü
            </Link>
            {BROWSE_CATEGORIES.map((category) => {
              const count = providersByCategory.get(category)?.size ?? 0
              const active = selected === category
              if (count === 0) {
                return (
                  <span
                    key={category}
                    className="flex cursor-not-allowed items-center gap-1.5 rounded-full border border-dashed px-4 py-2 text-sm text-muted-foreground/60"
                    title="Bu kategoride henüz üretici yok"
                  >
                    {CATEGORY_LABELS[category]}
                    <span className="text-[10px] uppercase">yakında</span>
                  </span>
                )
              }
              return (
                <Link
                  key={category}
                  href={`/ureticiler?kategori=${category}`}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  {CATEGORY_LABELS[category]}
                  <span
                    className={cn(
                      'rounded-full px-1.5 text-xs',
                      active ? 'bg-primary-foreground/20' : 'bg-muted',
                    )}
                  >
                    {count}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* 2 — En iyi performans gösterenler */}
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <Trophy className="size-5 text-amber-500" /> En İyi Performans Gösterenler
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {topPerformers.map((p, i) => (
              <Link key={p.id} href={`/ureticiler/${p.slug}`} className="block">
                <Card className="h-full transition-colors hover:border-primary">
                  <CardContent className="space-y-2 py-4">
                    <div className="flex items-center justify-between">
                      <span className="flex size-6 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-600">
                        {i + 1}
                      </span>
                      <span className="flex items-center gap-1 text-sm">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{p.ratingAvg.toFixed(1)}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 truncate text-sm font-semibold">
                      {p.name}
                      {p.verified && <BadgeCheck className="size-3.5 shrink-0 text-primary" />}
                    </div>
                    {p.salesCount !== undefined && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="size-3.5" />
                        {formatSalesTier(p.salesCount)} site içi satış
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 3 — Üretici listesi (kategoriye göre) */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            {selected ? `${CATEGORY_LABELS[selected]} Üreticileri (${visibleProviders.length})` : `Tüm Üreticiler (${visibleProviders.length})`}
          </h2>
          {visibleProviders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Bu kategoride henüz üretici yok.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {visibleProviders.map((p) => (
                <Link key={p.id} href={`/ureticiler/${p.slug}`} className="block">
                  <Card className="h-full transition-colors hover:border-primary">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="flex items-center gap-1.5 text-base">
                          {p.name}
                          {p.verified && <BadgeCheck className="size-4 text-primary" />}
                        </CardTitle>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          {p.ratingAvg.toFixed(1)} ({p.ratingCount})
                        </span>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {p.city}, {p.country}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {p.description && (
                        <p className="text-sm text-muted-foreground">{p.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {p.roles.map((role) => (
                          <Badge key={role} variant="secondary">
                            {ROLE_LABELS[role]}
                          </Badge>
                        ))}
                      </div>
                      {p.capacity && (
                        <p className="text-xs text-muted-foreground">
                          Bu hafta boş kapasite: {p.capacity.capacityUnits - p.capacity.bookedUnits} /{' '}
                          {p.capacity.capacityUnits}{' '}
                          {p.capacity.unit === 'panels' ? 'panel' : p.capacity.unit}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
