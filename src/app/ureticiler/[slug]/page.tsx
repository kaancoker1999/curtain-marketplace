import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, BadgeCheck, Factory, Handshake, MapPin, Ruler, Star, TrendingUp } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getOrders, getProducts, getProviders } from '@/lib/data'
import { formatSalesTier, formatTRY } from '@/lib/format'
import { CATEGORY_LABELS, PRICING_MODEL_LABELS, ROLE_LABELS, SERVICE_LABELS } from '@/lib/labels'
import type { ProductCategory } from '@/lib/types'

export const dynamic = 'force-dynamic'

// Ürünlere özel konfigüratör sayfaları
const PRODUCT_PAGES: Record<string, string> = {
  'cellular-shade': '/urun/cellular-shade',
  'roman-shade': '/urun/roman-shade',
}

// ---------------------------------------------------------------------------
// Katalog: kategoriye göre stilize stüdyo görselleri (SVG)
// ---------------------------------------------------------------------------

const CATALOG_PALETTES: Partial<Record<ProductCategory, string[]>> = {
  CELLULAR_SHADE: ['#E8E1D0', '#C2B08D', '#5A6470', '#8A8C5B'],
  ROMAN_SHADE: ['#C7C3BB', '#6E7379', '#B39B7A', '#46586E'],
  CURTAIN: ['#B57B3F', '#3A4458', '#8E3A3C', '#EFEDE4'],
  BLACKOUT: ['#3E2F28', '#5A6470', '#2B2B2B', '#4E3A4E'],
  SHEER: ['#F4F1E8', '#D8D8D0', '#E8E1D0', '#CFD2D4'],
  TULLE: ['#EFEDE4', '#E8E1D0', '#D9CCB4', '#F4F1E8'],
  ZEBRA_BLIND: ['#D6CFBF', '#9B9EA3', '#C0A88E', '#75706B'],
  ROLLER_BLIND: ['#D6CFBF', '#B3A99C', '#8D8579', '#5A5D64'],
}

type ThumbStyle = 'cellular' | 'roman' | 'roller' | 'curtain'

function thumbStyleFor(category: ProductCategory): ThumbStyle {
  if (category === 'CELLULAR_SHADE') return 'cellular'
  if (category === 'ROMAN_SHADE') return 'roman'
  if (category === 'ZEBRA_BLIND' || category === 'ROLLER_BLIND') return 'roller'
  return 'curtain'
}

function CatalogThumb({ style, hex }: { style: ThumbStyle; hex: string }) {
  return (
    <svg viewBox="0 0 160 200" className="w-full rounded-lg border bg-[#F7F5F0]">
      {/* duvar & zemin */}
      <rect x="0" y="0" width="160" height="200" fill="#F3F0E9" />
      <rect x="0" y="168" width="160" height="32" fill="#E7E2D6" />
      {/* pencere */}
      <rect x="28" y="24" width="104" height="128" rx="3" fill="#FFFFFF" stroke="#D8D2C6" strokeWidth="4" />
      <rect x="38" y="34" width="84" height="108" fill="#EAF2F7" />
      {style === 'cellular' && (
        <>
          <rect x="36" y="32" width="88" height="8" rx="2" fill="#C9BFAD" />
          <rect x="37" y="38" width="86" height="76" fill={hex} />
          {[48, 58, 68, 78, 88, 98, 108].map((y) => (
            <line key={y} x1="37" x2="123" y1={y} y2={y} stroke="#000" strokeOpacity="0.09" />
          ))}
          <rect x="36" y="112" width="88" height="5" rx="2" fill={hex} stroke="#000" strokeOpacity="0.14" />
        </>
      )}
      {style === 'roman' && (
        <>
          <rect x="36" y="32" width="88" height="7" rx="2" fill="#C9BFAD" />
          <rect x="37" y="37" width="86" height="80" fill={hex} />
          {[57, 77, 97, 117].map((y) => (
            <path key={y} d={`M 37 ${y} Q 80 ${y + 8} 123 ${y}`} fill="none" stroke="#000" strokeOpacity="0.16" strokeWidth="2.5" />
          ))}
        </>
      )}
      {style === 'roller' && (
        <>
          <rect x="34" y="30" width="92" height="12" rx="6" fill={hex} stroke="#000" strokeOpacity="0.15" />
          <rect x="38" y="40" width="84" height="66" fill={hex} opacity="0.92" />
          <rect x="36" y="104" width="88" height="4" rx="2" fill={hex} stroke="#000" strokeOpacity="0.18" />
        </>
      )}
      {style === 'curtain' && (
        <>
          <rect x="26" y="26" width="108" height="5" rx="2" fill="#8A7A62" />
          <path
            d="M 32 31 q 5 60 -2 121 h 24 q -8 -60 -2 -121 z"
            fill={hex}
          />
          <path
            d="M 128 31 q -5 60 2 121 h -24 q 8 -60 2 -121 z"
            fill={hex}
          />
          <path d="M 46 31 q 3 60 0 121" stroke="#000" strokeOpacity="0.12" fill="none" />
          <path d="M 114 31 q -3 60 0 121" stroke="#000" strokeOpacity="0.12" fill="none" />
        </>
      )}
      {/* saksı */}
      <circle cx="140" cy="164" r="10" fill="#A5BE8F" opacity="0.7" />
      <rect x="136" y="168" width="8" height="10" rx="2" fill="#B08968" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Sayfa
// ---------------------------------------------------------------------------

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

  // Katalog: her ürün için kategori paletinden renk varyasyonları
  const catalog = products.flatMap((p) => {
    const palette = CATALOG_PALETTES[p.category] ?? ['#D6CFBF', '#9B9EA3']
    return palette.map((hex, i) => ({
      key: `${p.id}-${i}`,
      style: thumbStyleFor(p.category),
      hex,
      label: p.name,
    }))
  })

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

        {/* 3 — Katalog (stüdyo görselleri) */}
        {catalog.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Katalog</h2>
            <p className="text-sm text-muted-foreground">
              Ürünlerin stüdyo çekimleri ve renk varyasyonları.
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {catalog.map((item) => (
                <figure key={item.key} className="space-y-1.5">
                  <CatalogThumb style={item.style} hex={item.hex} />
                  <figcaption className="truncate text-center text-xs text-muted-foreground">
                    {item.label}
                  </figcaption>
                </figure>
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
