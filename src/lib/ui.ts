import type { OrderStatus } from './types'

export function orderStatusVariant(
  status: OrderStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'COMPLETED':
    case 'DELIVERED':
    case 'INSTALLED':
      return 'secondary'
    case 'CANCELLED':
    case 'DISPUTED':
      return 'destructive'
    case 'DRAFT':
      return 'outline'
    default:
      return 'default'
  }
}
