import { BadgeCheck, MapPin, Star } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getWorkedWithProviders } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function CalistigimUreticilerPage() {
  const workedWith = await getWorkedWithProviders()

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Çalıştığım Üreticiler</h1>
          <p className="text-sm text-muted-foreground">
            Daha önce sipariş verdiğiniz sağlayıcılar ve iş birliği geçmişiniz.
          </p>
        </div>

        {workedWith.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Henüz tamamlanmış bir siparişiniz yok. Ana sayfadaki asistana ihtiyacınızı yazarak ilk
            eşleştirmenizi yapabilirsiniz.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {workedWith.map(({ provider, orderCount, totalSpend, lastOrderDate }) => (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="flex items-center gap-1.5 text-base">
                      {provider.name}
                      {provider.verified && <BadgeCheck className="size-4 text-primary" />}
                    </CardTitle>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                      {provider.ratingAvg.toFixed(1)}
                    </span>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {provider.city}, {provider.country}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-muted px-2 py-3">
                      <div className="text-lg font-semibold">{orderCount}</div>
                      <div className="text-xs text-muted-foreground">Sipariş</div>
                    </div>
                    <div className="rounded-lg bg-muted px-2 py-3">
                      <div className="text-lg font-semibold">
                        ${totalSpend.toLocaleString('en-US')}
                      </div>
                      <div className="text-xs text-muted-foreground">Toplam hacim</div>
                    </div>
                    <div className="rounded-lg bg-muted px-2 py-3">
                      <div className="text-lg font-semibold">{lastOrderDate}</div>
                      <div className="text-xs text-muted-foreground">Son sipariş</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
