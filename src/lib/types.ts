// App-level domain types shared by the UI, API routes, matching engine,
// demo dataset and the Prisma mappers. Kept independent of Prisma so the
// app works identically in demo mode and live-database mode.

export type OrgRole =
  | 'RETAILER'
  | 'MANUFACTURER'
  | 'SEWING_WORKSHOP'
  | 'FABRIC_SUPPLIER'
  | 'INSTALLER'
  | 'LOGISTICS_PROVIDER'
  | 'CREATIVE_STUDIO'

export type ServiceType =
  | 'SEWING'
  | 'INSTALLATION'
  | 'MEASUREMENT'
  | 'DESIGN'
  | 'PLEATING'
  | 'EMBROIDERY'
  | 'MOTORIZATION'
  | 'LOGISTICS'

export type PricingModel =
  | 'FIXED'
  | 'PER_METER'
  | 'PER_SQM'
  | 'PER_PANEL'
  | 'PER_HOUR'
  | 'PER_KM'

export type ProductCategory =
  | 'CURTAIN'
  | 'SHEER'
  | 'BLACKOUT'
  | 'ROLLER_BLIND'
  | 'ZEBRA_BLIND'
  | 'VENETIAN_BLIND'
  | 'ROMAN_SHADE'
  | 'TULLE'
  | 'ACCESSORY'

export type OrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'QUALITY_CHECK'
  | 'READY_FOR_SHIPMENT'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'INSTALLED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'

export interface ServiceOfferingSummary {
  type: ServiceType
  title: string
  pricingModel: PricingModel
  basePrice: number
  minCharge?: number
  leadTimeDays: number
  serviceRadiusKm?: number
}

export interface CapacitySummary {
  capacityUnits: number
  bookedUnits: number
  unit: string
}

/** A provider organization as seen by the matching engine and the UI. */
export interface Provider {
  id: string
  name: string
  slug: string
  description?: string
  roles: OrgRole[]
  city: string
  country: string
  lat: number
  lng: number
  verified: boolean
  ratingAvg: number
  ratingCount: number
  services: ServiceOfferingSummary[]
  capacity?: CapacitySummary
  /** Fabric roll widths (cm) the provider works with — drives waste optimization. */
  fabricRollWidthsCm?: number[]
  pricingRules?: PricingRuleSummary[]
}

export interface PricingRuleSummary {
  type: 'VOLUME_DISCOUNT' | 'RUSH_FEE' | 'SEASONAL_ADJUSTMENT' | 'LOYALTY_DISCOUNT' | 'MINIMUM_ORDER'
  name: string
  params: Record<string, number>
}

export interface ProductSummary {
  id: string
  orgId: string
  orgName: string
  name: string
  slug: string
  category: ProductCategory
  basePrice: number
  currency: string
  leadTimeDays: number
  description?: string
}

export interface FabricSummary {
  id: string
  orgId: string
  orgName: string
  name: string
  sku: string
  composition?: string
  color?: string
  widthCm: number
  pricePerMeter: number
  currency: string
  stockMeters: number
}

export interface OrderSummary {
  id: string
  orderNumber: string
  buyerName: string
  sellerName: string
  status: OrderStatus
  total: number
  currency: string
  placedAt: string // ISO date
  dueDate?: string
  itemCount: number
}

export interface PlatformStats {
  providerCount: number
  productCount: number
  openRfqCount: number
  activeOrderCount: number
  gmv: number
  demoMode: boolean
}
