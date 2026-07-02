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
import { orderStatusVariant } from '@/lib/ui'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [stats, orders] = await Promise.all([getStats(), getOrders()])

  const cards = [
    { label: 'Network providers', value: stats.providerCount },
    { label: 'Active products', value: stats.productCount },
    { label: 'Open RFQs', value: stats.openRfqCount },
    { label: 'Active orders', value: stats.activeOrderCount },
    { label: 'Total GMV', value: `$${stats.gmv.toLocaleString('en-US')}` },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Platform activity across your curtain supply network.
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
          <CardTitle>Recent orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Placed</TableHead>
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
                      {o.status.replaceAll('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ${o.total.toLocaleString('en-US')}
                  </TableCell>
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
