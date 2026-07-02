import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, BadgeCheck, Factory, MapPin, Ruler, Star } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getProducts, getProviders } from '@/lib/data'
import { formatTRY } from '@/lib/format'
import { PRICING_MODEL_LABELS, ROLE_LABELS, SERVICE_LABELS, CATEGORY_LABELS } from '@/lib/labels'

export const dynamic = 'force-dynamic'

// Ürünlere özel konfigüratör sayfaları
const PRODUCT_PAGES: Record<string, string> = {
  'cellular-shade': '/urun/cellular-shade',
}

export default async function UreticiDetayPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const providers = await getProviders()
  const provider = providers.find((p) => p.slug === slug)
  if (!provider) notFound()

  const products = (await getProducts()).filter((p) => p.orgId === provider.id)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
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
          {provider.description && (
            <p className="max-w-3xl text-muted-foreground">{provider.description}</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {provider.roles.map((role) => (
              <Badge key={role} variant="secondary">
                {ROLE_LABELS[role]}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Factory className="size-4" /> Haftalık kapasite
              </CardTitle>
            </CardHeader>
            <CardContent>
              {provider.capacity ? (
                <>
                  <div className="text-2xl font-semibold">
                    {provider.capacity.capacityUnits - provider.capacity.bookedUnits}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    / {provider.capacity.capacityUnits}{' '}
                    {provider.capacity.unit === 'panels' ? 'panel' : provider.capacity.unit} boş
                  </p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Belirtilmemiş</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Ruler className="size-4" /> Kumaş top eni
              </CardTitle>
            </CardHeader>
            <CardContent>
              {provider.fabricRollWidthsCm?.length ? (
                <>
                  <div className="text-2xl font-semibold">
                    {provider.fabricRollWidthsCm.join(' / ')} cm
                  </div>
                  <p className="text-xs text-muted-foreground">fire optimizasyonunda kullanılır</p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Belirtilmemiş</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Doğrulama</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{provider.verified ? 'Doğrulandı' : 'Beklemede'}</div>
              <p className="text-xs text-muted-foreground">platform doğrulaması</p>
            </CardContent>
          </Card>
        </div>

        {provider.services.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Hizmetler</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
          </section>
        )}

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
      </main>
    </div>
  )
}
