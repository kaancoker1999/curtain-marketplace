// Data-access layer with graceful degradation:
// every reader tries the live PostgreSQL database first and falls back to the
// in-memory demo dataset when the DB is unreachable, so the app is fully
// usable before any infrastructure is provisioned.

import { prisma } from './db'
import {
  DEMO_FABRICS,
  DEMO_ORDERS,
  DEMO_PRODUCTS,
  DEMO_PROVIDERS,
} from './demo-data'
import type {
  FabricSummary,
  OrderSummary,
  PlatformStats,
  ProductSummary,
  Provider,
} from './types'

let dbAvailable: boolean | null = null
let lastProbe = 0
const PROBE_TTL_MS = 30_000

export async function isDbAvailable(): Promise<boolean> {
  const now = Date.now()
  if (dbAvailable !== null && now - lastProbe < PROBE_TTL_MS) return dbAvailable
  lastProbe = now
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('db probe timeout')), 1500),
      ),
    ])
    dbAvailable = true
  } catch {
    dbAvailable = false
  }
  return dbAvailable
}

export async function getProviders(): Promise<Provider[]> {
  if (!(await isDbAvailable())) return DEMO_PROVIDERS
  try {
    const orgs = await prisma.organization.findMany({
      where: { roles: { some: { role: { not: 'RETAILER' } } } },
      include: {
        roles: true,
        locations: { where: { isPrimary: true }, take: 1 },
        services: { where: { active: true } },
        capacities: { orderBy: { weekStart: 'desc' }, take: 1 },
        fabrics: { where: { active: true }, select: { widthCm: true } },
        pricingRules: { where: { active: true } },
      },
    })
    return orgs.map((org) => {
      const loc = org.locations[0]
      const cap = org.capacities[0]
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        description: org.description ?? undefined,
        roles: org.roles.map((r) => r.role),
        city: org.city,
        country: org.country,
        lat: loc?.lat ?? 0,
        lng: loc?.lng ?? 0,
        verified: org.verified,
        ratingAvg: org.ratingAvg,
        ratingCount: org.ratingCount,
        services: org.services.map((s) => ({
          type: s.type,
          title: s.title,
          pricingModel: s.pricingModel,
          basePrice: Number(s.basePrice),
          minCharge: s.minCharge ? Number(s.minCharge) : undefined,
          leadTimeDays: s.leadTimeDays,
          serviceRadiusKm: s.serviceRadiusKm ?? undefined,
        })),
        capacity: cap
          ? { capacityUnits: cap.capacityUnits, bookedUnits: cap.bookedUnits, unit: cap.unit }
          : undefined,
        fabricRollWidthsCm: org.fabrics.length
          ? [...new Set(org.fabrics.map((f) => f.widthCm))]
          : undefined,
        pricingRules: org.pricingRules.map((r) => ({
          type: r.type,
          name: r.name,
          params: r.params as Record<string, number>,
        })),
      } satisfies Provider
    })
  } catch {
    return DEMO_PROVIDERS
  }
}

export async function getProducts(): Promise<ProductSummary[]> {
  if (!(await isDbAvailable())) return DEMO_PRODUCTS
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: { org: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return products.map((p) => ({
      id: p.id,
      orgId: p.orgId,
      orgName: p.org.name,
      name: p.name,
      slug: p.slug,
      category: p.category,
      basePrice: Number(p.basePrice),
      currency: p.currency,
      leadTimeDays: p.leadTimeDays,
      description: p.description ?? undefined,
    }))
  } catch {
    return DEMO_PRODUCTS
  }
}

export async function getFabrics(): Promise<FabricSummary[]> {
  if (!(await isDbAvailable())) return DEMO_FABRICS
  try {
    const fabrics = await prisma.fabric.findMany({
      where: { active: true },
      include: { org: { select: { name: true } } },
    })
    return fabrics.map((f) => ({
      id: f.id,
      orgId: f.orgId,
      orgName: f.org.name,
      name: f.name,
      sku: f.sku,
      composition: f.composition ?? undefined,
      color: f.color ?? undefined,
      widthCm: f.widthCm,
      pricePerMeter: Number(f.pricePerMeter),
      currency: f.currency,
      stockMeters: f.stockMeters,
    }))
  } catch {
    return DEMO_FABRICS
  }
}

export async function getOrders(): Promise<OrderSummary[]> {
  if (!(await isDbAvailable())) return DEMO_ORDERS
  try {
    const orders = await prisma.order.findMany({
      include: {
        buyer: { select: { name: true } },
        seller: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { placedAt: 'desc' },
      take: 50,
    })
    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      buyerName: o.buyer.name,
      sellerName: o.seller.name,
      status: o.status,
      total: Number(o.total),
      currency: o.currency,
      placedAt: o.placedAt.toISOString().slice(0, 10),
      dueDate: o.dueDate?.toISOString().slice(0, 10),
      itemCount: o._count.items,
    }))
  } catch {
    return DEMO_ORDERS
  }
}

export interface WorkedWithProvider {
  provider: Provider
  orderCount: number
  totalSpend: number
  lastOrderDate: string
}

/**
 * Providers the buyer has actually ordered from, with relationship stats.
 * (Until auth lands there is no "current organization", so this aggregates
 * across all orders — in demo mode and live mode alike.)
 */
export async function getWorkedWithProviders(): Promise<WorkedWithProvider[]> {
  const [providers, orders] = await Promise.all([getProviders(), getOrders()])
  const byName = new Map(providers.map((p) => [p.name, p]))
  const stats = new Map<string, WorkedWithProvider>()
  for (const order of orders) {
    const provider = byName.get(order.sellerName)
    if (!provider) continue
    const entry = stats.get(provider.id)
    if (entry) {
      entry.orderCount += 1
      entry.totalSpend += order.total
      if (order.placedAt > entry.lastOrderDate) entry.lastOrderDate = order.placedAt
    } else {
      stats.set(provider.id, {
        provider,
        orderCount: 1,
        totalSpend: order.total,
        lastOrderDate: order.placedAt,
      })
    }
  }
  return [...stats.values()].sort((a, b) => b.totalSpend - a.totalSpend)
}

function demoStats(): PlatformStats {
  const activeOrders = DEMO_ORDERS.filter(
    (o) => !['COMPLETED', 'CANCELLED', 'DELIVERED'].includes(o.status),
  )
  return {
    providerCount: DEMO_PROVIDERS.length,
    productCount: DEMO_PRODUCTS.length,
    openRfqCount: 3,
    activeOrderCount: activeOrders.length,
    gmv: DEMO_ORDERS.reduce((sum, o) => sum + o.total, 0),
    demoMode: true,
  }
}

export async function getStats(): Promise<PlatformStats> {
  if (!(await isDbAvailable())) return demoStats()
  try {
    const [providerCount, productCount, openRfqCount, activeOrderCount, gmvAgg] =
      await Promise.all([
        prisma.organization.count({
          where: { roles: { some: { role: { not: 'RETAILER' } } } },
        }),
        prisma.product.count({ where: { active: true } }),
        prisma.rfq.count({ where: { status: { in: ['OPEN', 'MATCHED'] } } }),
        prisma.order.count({
          where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
        }),
        prisma.order.aggregate({ _sum: { total: true } }),
      ])
    return {
      providerCount,
      productCount,
      openRfqCount,
      activeOrderCount,
      gmv: Number(gmvAgg._sum.total ?? 0),
      demoMode: false,
    }
  } catch {
    return demoStats()
  }
}
