import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getFabrics, getProducts } from '@/lib/data'

// Products with a dedicated configurator page get a click-through.
const PRODUCT_PAGES: Record<string, string> = {
  'cellular-shade': '/urun/cellular-shade',
}

export const dynamic = 'force-dynamic'

export default async function MarketplacePage() {
  const [products, fabrics] = await Promise.all([getProducts(), getFabrics()])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Marketplace</h1>
        <p className="text-sm text-muted-foreground">
          Finished products and fabrics from your provider network.
        </p>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          <TabsTrigger value="fabrics">Fabrics ({fabrics.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const href = PRODUCT_PAGES[p.slug]
            const card = (
              <Card key={p.id} className={href ? 'transition-colors hover:border-primary' : undefined}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <Badge variant="secondary">{p.category.replaceAll('_', ' ')}</Badge>
                  </div>
                  <CardDescription>{p.orgName}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {p.description && (
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">
                      ${p.basePrice.toLocaleString('en-US')} <span className="font-normal text-muted-foreground">/ panel</span>
                    </span>
                    <span className="text-muted-foreground">{p.leadTimeDays}d lead time</span>
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
                    ${f.pricePerMeter.toFixed(2)} <span className="font-normal text-muted-foreground">/ m</span>
                  </span>
                  <span className="text-muted-foreground">
                    {f.stockMeters.toLocaleString('en-US')} m in stock
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
