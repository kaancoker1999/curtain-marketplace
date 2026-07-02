import { BadgeCheck, MapPin, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getProviders } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function NetworkPage() {
  const providers = await getProviders()

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Network</h1>
        <p className="text-sm text-muted-foreground">
          Manufacturers, workshops, suppliers, installers and studios on the platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {providers.map((p) => (
          <Card key={p.id}>
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
                    {role.replaceAll('_', ' ')}
                  </Badge>
                ))}
              </div>
              {p.capacity && (
                <p className="text-xs text-muted-foreground">
                  Capacity this week: {p.capacity.capacityUnits - p.capacity.bookedUnits} of{' '}
                  {p.capacity.capacityUnits} {p.capacity.unit} free
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
