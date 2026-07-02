import { BadgeCheck, Layers, ThermometerSun, Volume2 } from 'lucide-react'
import { CellularShadeConfigurator } from '@/components/product/cellular-shade-configurator'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Hücreli Perde (Cellular Shade) — Carra Woods | CurtainOS',
  description:
    'Ölçüye özel hücreli (petek) perde: tek/çift/üç hücre, tül geçirgen, ışık süzen ve karartma seçenekleri, ipsiz, zincirli veya motorlu kullanım.',
}

const FEATURES = [
  { icon: Layers, label: 'Petek hücre yapısı' },
  { icon: ThermometerSun, label: 'Enerji verimliliği' },
  { icon: Volume2, label: 'Ses yalıtımı' },
]

export default function CellularShadePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <BadgeCheck className="size-4 text-primary" />
            Üretici: <span className="font-medium text-foreground">Carra Woods</span> · Doğrulanmış
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">Hücreli Perde</h1>
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

        <CellularShadeConfigurator />
      </main>
    </div>
  )
}
