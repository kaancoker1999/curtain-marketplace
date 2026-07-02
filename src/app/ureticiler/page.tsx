import Link from 'next/link'
import { BadgeCheck, MapPin, Star } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getProviders } from '@/lib/data'
import { ROLE_LABELS } from '@/lib/labels'

export const dynamic = 'force-dynamic'

export default async function UreticilerPage() {
  const providers = await getProviders()

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Üreticiler</h1>
          <p className="text-sm text-muted-foreground">
            Platformdaki tüm üretici, atölye, tedarikçi ve hizmet sağlayıcılar. Detay için karta tıklayın.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {providers.map((p) => (
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
      </main>
    </div>
  )
}
