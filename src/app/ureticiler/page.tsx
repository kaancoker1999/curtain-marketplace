import Link from 'next/link'
import { BadgeCheck, MapPin, Star, TrendingUp, Trophy } from 'lucide-react'
import { CategoryTile } from '@/components/category-tile'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getProducts, getProviders } from '@/lib/data'
import { formatSalesTier } from '@/lib/format'
import { CATEGORY_LABELS, ROLE_LABELS, SERVICE_LABELS } from '@/lib/labels'
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

  // Üreticinin sunduğu ürün kategorileri + hizmetler (kart altı etiketleri)
  function offeringsOf(providerId: string, serviceTypes: { type: string }[]): string[] {
    const productLabels = products
      .filter((p) => p.orgId === providerId)
      .map((p) => CATEGORY_LABELS[p.category])
    const serviceLabels = serviceTypes.map((s) => SERVICE_LABELS[s.type as keyof typeof SERVICE_LABELS])
    return [...new Set([...productLabels, ...serviceLabels])]
  }

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

        {/* 1 — Kategoriler (görselli vitrin) */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Kategoriler</h2>
            {selected && (
              <Link href="/ureticiler" className="text-sm font-medium text-primary hover:underline">
                Filtreyi temizle — tümünü göster
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {BROWSE_CATEGORIES.map((category) => {
              const count = providersByCategory.get(category)?.size ?? 0
              const active = selected === category
              const tile = (
                <div
                  className={cn(
                    'overflow-hidden rounded-xl border transition-all',
                    active && 'ring-2 ring-primary ring-offset-2',
                    count > 0 ? 'hover:border-primary hover:shadow-md' : 'opacity-55 grayscale',
                  )}
                >
                  <div className="aspect-[3/2]">
                    <CategoryTile category={category} />
                  </div>
                  <div className="flex items-center justify-between border-t bg-background px-3 py-2.5">
                    <span className="truncate text-sm font-medium">{CATEGORY_LABELS[category]}</span>
                    {count > 0 ? (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {count} üretici
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        yakında
                      </span>
                    )}
                  </div>
                </div>
              )
              return count > 0 ? (
                <Link
                  key={category}
                  href={active ? '/ureticiler' : `/ureticiler?kategori=${category}`}
                  className="block"
                >
                  {tile}
                </Link>
              ) : (
                <div key={category} title="Bu kategoride henüz üretici yok">
                  {tile}
                </div>
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
                    {(() => {
                      const offerings = offeringsOf(p.id, p.services)
                      if (offerings.length === 0) return null
                      const shown = offerings.slice(0, 3)
                      const kalan = offerings.length - shown.length
                      return (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {shown.map((label) => (
                            <Badge key={label} variant="secondary" className="text-[10px]">
                              {label}
                            </Badge>
                          ))}
                          {kalan > 0 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{kalan}
                            </Badge>
                          )}
                        </div>
                      )
                    })()}
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
            <div className="grid grid-cols-1 gap-4">
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
