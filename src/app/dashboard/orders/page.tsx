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
import { orderStatusVariant } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const orders = await getOrders()

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">
          All orders across products, fabric and services.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Placed</TableHead>
                <TableHead>Due</TableHead>
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
                      {o.status.replaceAll('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ${o.total.toLocaleString('en-US')}
                  </TableCell>
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
