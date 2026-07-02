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
import { getOrders } from '@/lib/data'
import { formatTRY } from '@/lib/format'
import { ORDER_STATUS_LABELS } from '@/lib/labels'
import { orderStatusVariant } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const orders = await getOrders()

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Siparişler</h1>
        <p className="text-sm text-muted-foreground">
          Ürün, kumaş ve hizmet siparişlerinizin tamamı.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tüm siparişler ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sipariş</TableHead>
                <TableHead>Alıcı</TableHead>
                <TableHead>Satıcı</TableHead>
                <TableHead>Kalem</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Termin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.orderNumber}</TableCell>
                  <TableCell>{o.buyerName}</TableCell>
                  <TableCell>{o.sellerName}</TableCell>
                  <TableCell>{o.itemCount}</TableCell>
                  <TableCell>
                    <Badge variant={orderStatusVariant(o.status)}>
                      {ORDER_STATUS_LABELS[o.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatTRY(o.total)}</TableCell>
                  <TableCell className="text-muted-foreground">{o.placedAt}</TableCell>
                  <TableCell className="text-muted-foreground">{o.dueDate ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
