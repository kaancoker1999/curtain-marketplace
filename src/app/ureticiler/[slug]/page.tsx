import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, BadgeCheck, BookOpen, Factory, FileText, Handshake, MapPin, Ruler, Star, TrendingUp } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getOrders, getProducts, getProviders } from '@/lib/data'
import { formatSalesTier, formatTRY } from '@/lib/format'
import { CATEGORY_LABELS, PRICING_MODEL_LABELS, ROLE_LABELS, SERVICE_LABELS } from '@/lib/labels'

export const dynamic = 'force-dynamic'

// Ürünlere özel konfigüratör sayfaları
const PRODUCT_PAGES: Record<string, string> = {
  'cellular-shade': '/urun/cellular-shade',
  'roman-shade': '/urun/roman-shade',
}

export default async function UreticiDetayPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [providers, allProducts, orders] = await Promise.all([
    getProviders(),
    getProducts(),
    getOrders(),
  ])
  const provider = providers.find((p) => p.slug === slug)
  if (!provider) notFound()

  const products = allProducts.filter((p) => p.orgId === provider.id)
  const partnerNames = [
    ...new Set(orders.filter((o) => o.sellerName === provider.name).map((o) => o.buyerName)),
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-10 px-6 py-8">
        {/* Başlık */}
        <div className="space-y-3">
          <Link href="/ureticiler" className="text-sm text-muted-foreground hover:text-foreground">
            ← Üreticiler
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
                {provider.name}
                {provider.verified && <BadgeCheck className="size-6 text-primary" />}
              </h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-4" /> {provider.city}, {provider.country}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg border px-3 py-2">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{provider.ratingAvg.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({provider.ratingCount} değerlendirme)</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {provider.roles.map((role) => (
              <Badge key={role} variant="secondary">
                {ROLE_LABELS[role]}
              </Badge>
            ))}
          </div>
        </div>

        {/* 1 — Tanıtım */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">Hakkında</h2>
          <p className="max-w-3xl leading-relaxed text-muted-foreground">
            {provider.about ?? provider.description ?? 'Bu üretici henüz tanıtım metni eklemedi.'}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {provider.capacity && (
              <span className="flex items-center gap-1.5">
                <Factory className="size-4" />
                Haftalık kapasite: {provider.capacity.capacityUnits}{' '}
                {provider.capacity.unit === 'panels' ? 'panel' : provider.capacity.unit}
              </span>
            )}
            {provider.fabricRollWidthsCm?.length ? (
              <span className="flex items-center gap-1.5">
                <Ruler className="size-4" />
                Kumaş top eni: {provider.fabricRollWidthsCm.join(' / ')} cm
              </span>
            ) : null}
          </div>
          {provider.services.length > 0 && (
            <div className="grid grid-cols-1 gap-3 pt-2 md:grid-cols-2">
              {provider.services.map((s) => (
                <Card key={s.title}>
                  <CardContent className="flex items-center justify-between gap-3 py-4">
                    <div>
                      <div className="font-medium">{s.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {SERVICE_LABELS[s.type]} · {s.leadTimeDays} gün termin
                        {s.serviceRadiusKm ? ` · ${s.serviceRadiusKm} km hizmet yarıçapı` : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatTRY(s.basePrice)}</div>
                      <div className="text-xs text-muted-foreground">
                        {PRICING_MODEL_LABELS[s.pricingModel]}
                        {s.minCharge ? ` · min ${formatTRY(s.minCharge)}` : ''}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* 2 — Ürünler */}
        {products.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Ürünler</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => {
                const href = PRODUCT_PAGES[p.slug]
                const card = (
                  <Card className={href ? 'h-full transition-colors hover:border-primary' : 'h-full'}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{p.name}</CardTitle>
                        <Badge variant="secondary">{CATEGORY_LABELS[p.category]}</Badge>
                      </div>
                      <CardDescription>{p.leadTimeDays} gün termin</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {p.description && (
                        <p className="text-sm text-muted-foreground">{p.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">
                          {formatTRY(p.basePrice)}{' '}
                          <span className="font-normal text-muted-foreground">/ panel</span>
                        </span>
                        {href && (
                          <span className="flex items-center gap-1 font-medium text-primary">
                            Yapılandır <ArrowRight className="size-3.5" />
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
                return href ? (
                  <Link key={p.id} href={href} className="block">
                    {card}
                  </Link>
                ) : (
                  <div key={p.id}>{card}</div>
                )
              })}
            </div>
          </section>
        )}

        {/* 3 — Katalog (PDF) */}
        {provider.catalogs && provider.catalogs.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Katalog</h2>
            <p className="text-sm text-muted-foreground">
              Üreticinin yüklediği ürün katalogları.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {provider.catalogs.map((catalog) => (
                <a
                  key={catalog.file}
                  href={catalog.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="h-full transition-colors hover:border-primary">
                    <CardContent className="flex items-center gap-4 py-5">
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="size-7 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{catalog.title}</div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <FileText className="size-3.5" />
                          PDF
                          {catalog.pages ? ` · ${catalog.pages} sayfa` : ''}
                          {catalog.sizeMB ? ` · ${catalog.sizeMB} MB` : ''}
                        </div>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                        Görüntüle <ArrowRight className="size-3.5" />
                      </span>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* 4 — Platform entegrasyonu */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight">Platformda {provider.name}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {provider.salesCount !== undefined && (
              <Card>
                <CardContent className="flex items-center gap-4 py-5">
                  <div className="flex size-11 items-center justify-center rounded-full bg-primary/10">
                    <TrendingUp className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-semibold">{formatSalesTier(provider.salesCount)}</div>
                    <div className="text-sm text-muted-foreground">site içi satış</div>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardContent className="flex items-center gap-4 py-5">
                <div className="flex size-11 items-center justify-center rounded-full bg-primary/10">
                  <Handshake className="size-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-semibold">{partnerNames.length}</div>
                  <div className="text-sm text-muted-foreground">platform partneri</div>
                </div>
              </CardContent>
            </Card>
          </div>
          {partnerNames.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Platform üzerinde birlikte çalıştığı üyeler:{' '}
              <span className="text-foreground">{partnerNames.join(' · ')}</span>
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
