import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getFabrics, getProducts } from '@/lib/data'
import { formatTRY } from '@/lib/format'
import { CATEGORY_LABELS } from '@/lib/labels'

export const dynamic = 'force-dynamic'

// Özel konfigüratör sayfası olan ürünler tıklanabilir.
const PRODUCT_PAGES: Record<string, string> = {
  'cellular-shade': '/urun/cellular-shade',
}

export default async function MarketplacePage() {
  const [products, fabrics] = await Promise.all([getProducts(), getFabrics()])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pazar Yeri</h1>
        <p className="text-sm text-muted-foreground">
          Sağlayıcı ağınızdan hazır ürünler ve kumaşlar.
        </p>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Ürünler ({products.length})</TabsTrigger>
          <TabsTrigger value="fabrics">Kumaşlar ({fabrics.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const href = PRODUCT_PAGES[p.slug]
            const card = (
              <Card key={p.id} className={href ? 'h-full transition-colors hover:border-primary' : 'h-full'}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <Badge variant="secondary">{CATEGORY_LABELS[p.category]}</Badge>
                  </div>
                  <CardDescription>{p.orgName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {p.description && (
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">
                      {formatTRY(p.basePrice)} <span className="font-normal text-muted-foreground">/ panel</span>
                    </span>
                    <span className="text-muted-foreground">{p.leadTimeDays} gün termin</span>
                  </div>
                  {href && (
                    <p className="text-sm font-medium text-primary">Ölçüye özel yapılandır →</p>
                  )}
                </CardContent>
              </Card>
            )
            return href ? (
              <Link key={p.id} href={href} className="block">
                {card}
              </Link>
            ) : (
              card
            )
          })}
        </TabsContent>

        <TabsContent value="fabrics" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fabrics.map((f) => (
            <Card key={f.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{f.name}</CardTitle>
                  <Badge variant="outline">{f.widthCm} cm</Badge>
                </div>
                <CardDescription>
                  {f.orgName} · {f.sku}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {f.composition && <p className="text-muted-foreground">{f.composition}</p>}
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    {formatTRY(f.pricePerMeter)} <span className="font-normal text-muted-foreground">/ m</span>
                  </span>
                  <span className="text-muted-foreground">
                    {f.stockMeters.toLocaleString('tr-TR')} m stokta
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
