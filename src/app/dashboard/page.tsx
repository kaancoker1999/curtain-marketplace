import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getOrders, getStats } from '@/lib/data'
import { formatTRY } from '@/lib/format'
import { ORDER_STATUS_LABELS } from '@/lib/labels'
import { orderStatusVariant } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [stats, orders] = await Promise.all([getStats(), getOrders()])

  const cards = [
    { label: 'Ağdaki sağlayıcı', value: stats.providerCount },
    { label: 'Aktif ürün', value: stats.productCount },
    { label: 'Açık talep (RFQ)', value: stats.openRfqCount },
    { label: 'Aktif sipariş', value: stats.activeOrderCount },
    { label: 'Toplam ciro', value: formatTRY(stats.gmv) },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Genel Bakış</h1>
        <p className="text-sm text-muted-foreground">
          Tedarik ağınızdaki platform aktivitesi.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {c.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{c.value}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Son siparişler</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sipariş</TableHead>
                <TableHead>Alıcı</TableHead>
                <TableHead>Satıcı</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
                <TableHead>Tarih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.orderNumber}</TableCell>
                  <TableCell>{o.buyerName}</TableCell>
                  <TableCell>{o.sellerName}</TableCell>
                  <TableCell>
                    <Badge variant={orderStatusVariant(o.status)}>
                      {ORDER_STATUS_LABELS[o.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatTRY(o.total)}</TableCell>
                  <TableCell className="text-muted-foreground">{o.placedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
