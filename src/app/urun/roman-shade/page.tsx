import { BadgeCheck, Layers, Palette, Waves } from 'lucide-react'
import { RomanShadeConfigurator } from '@/components/product/roman-shade-configurator'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Roman Perde (Roman Shade) — Carra Woods | CurtainOS',
  description:
    'Ölçüye özel Roman perde: dört pile stili, üç kumaş koleksiyonu, ipsiz/zincirli/motorlu mekanizma, ışık süzen veya karartma astar seçenekleri.',
}

const FEATURES = [
  { icon: Waves, label: 'Yumuşak kumaş katları' },
  { icon: Layers, label: 'Dört pile stili' },
  { icon: Palette, label: 'Üç kumaş koleksiyonu' },
]

export default function RomanShadePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <BadgeCheck className="size-4 text-primary" />
            Üretici: <span className="font-medium text-foreground">Carra Woods</span> · Doğrulanmış
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">Roman Perde</h1>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {FEATURES.map((f) => (
              <Badge key={f.label} variant="secondary" className="gap-1.5">
                <f.icon className="size-3.5" /> {f.label}
              </Badge>
            ))}
          </div>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Ölçüye özel üretilir. Aşağıdaki adımları tamamlayın; fiyat, seçimlerinize göre anlık
            hesaplanır ve sipariş talebi doğrudan üreticiye iletilir.
          </p>
        </div>

        <RomanShadeConfigurator />
      </main>
    </div>
  )
}
