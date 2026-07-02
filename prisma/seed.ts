// Seeds the database from the same dataset that powers demo mode
// (src/lib/demo-data.ts), so switching from demo to live is seamless.
// Run with: npx prisma db seed

import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import {
  DEMO_FABRICS,
  DEMO_PRODUCTS,
  DEMO_PROVIDERS,
} from '../src/lib/demo-data'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' })
const prisma = new PrismaClient({ adapter })

function mondayOfCurrentWeek(): Date {
  const now = new Date()
  const day = now.getUTCDay() || 7
  now.setUTCDate(now.getUTCDate() - day + 1)
  now.setUTCHours(0, 0, 0, 0)
  return now
}

async function main() {
  console.log('Seeding CurtainOS…')

  // Providers (manufacturers, workshops, installers, suppliers, studios)
  for (const p of DEMO_PROVIDERS) {
    await prisma.organization.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        city: p.city,
        country: p.country,
        verified: p.verified,
        ratingAvg: p.ratingAvg,
        ratingCount: p.ratingCount,
        roles: { create: p.roles.map((role) => ({ role })) },
        locations: {
          create: {
            label: 'Headquarters',
            addressLine: `${p.city} industrial district`,
            city: p.city,
            country: p.country,
            lat: p.lat,
            lng: p.lng,
            isPrimary: true,
          },
        },
        services: {
          create: p.services.map((s) => ({
            type: s.type,
            title: s.title,
            pricingModel: s.pricingModel,
            basePrice: s.basePrice,
            minCharge: s.minCharge,
            leadTimeDays: s.leadTimeDays,
            serviceRadiusKm: s.serviceRadiusKm,
          })),
        },
        capacities: p.capacity
          ? {
              create: {
                weekStart: mondayOfCurrentWeek(),
                capacityUnits: p.capacity.capacityUnits,
                bookedUnits: p.capacity.bookedUnits,
                unit: p.capacity.unit,
              },
            }
          : undefined,
        pricingRules: p.pricingRules
          ? {
              create: p.pricingRules.map((r, i) => ({
                type: r.type,
                name: r.name,
                params: r.params,
                priority: i,
              })),
            }
          : undefined,
      },
    })
  }

  for (const prod of DEMO_PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: {
        id: prod.id,
        orgId: prod.orgId,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        category: prod.category,
        basePrice: prod.basePrice,
        currency: prod.currency,
        leadTimeDays: prod.leadTimeDays,
        images: [],
      },
    })
  }

  for (const fab of DEMO_FABRICS) {
    await prisma.fabric.upsert({
      where: { sku: fab.sku },
      update: {},
      create: {
        id: fab.id,
        orgId: fab.orgId,
        name: fab.name,
        sku: fab.sku,
        composition: fab.composition,
        color: fab.color,
        widthCm: fab.widthCm,
        pricePerMeter: fab.pricePerMeter,
        currency: fab.currency,
        stockMeters: fab.stockMeters,
      },
    })
  }

  // Two retailer organizations + one open RFQ to exercise the matching flow
  const retailer = await prisma.organization.upsert({
    where: { slug: 'perde-palace' },
    update: {},
    create: {
      name: 'Perde Palace',
      slug: 'perde-palace',
      description: 'Curtain retail chain, 6 showrooms.',
      city: 'Istanbul',
      country: 'Türkiye',
      verified: true,
      roles: { create: [{ role: 'RETAILER' }] },
      locations: {
        create: {
          label: 'Flagship store',
          addressLine: 'Nişantaşı',
          city: 'Istanbul',
          country: 'Türkiye',
          lat: 41.0082,
          lng: 28.9784,
          isPrimary: true,
        },
      },
    },
  })

  await prisma.organization.upsert({
    where: { slug: 'homestyle-interiors' },
    update: {},
    create: {
      name: 'HomeStyle Interiors',
      slug: 'homestyle-interiors',
      description: 'Interior design retailer.',
      city: 'Ankara',
      country: 'Türkiye',
      verified: true,
      roles: { create: [{ role: 'RETAILER' }] },
      locations: {
        create: {
          label: 'Showroom',
          addressLine: 'Çankaya',
          city: 'Ankara',
          country: 'Türkiye',
          lat: 39.9334,
          lng: 32.8597,
          isPrimary: true,
        },
      },
    },
  })

  const existingRfq = await prisma.rfq.findFirst({
    where: { buyerOrgId: retailer.id, title: 'Hotel project — 60 blackout panels' },
  })
  if (!existingRfq) {
    await prisma.rfq.create({
      data: {
        buyerOrgId: retailer.id,
        title: 'Hotel project — 60 blackout panels',
        description: 'Made-to-measure blackout curtains for a 30-room boutique hotel.',
        status: 'OPEN',
        deliveryCity: 'Istanbul',
        deliveryCountry: 'Türkiye',
        deliveryLat: 41.0082,
        deliveryLng: 28.9784,
        neededBy: new Date(Date.now() + 21 * 24 * 3600 * 1000),
        budgetMax: 8000,
        items: {
          create: {
            itemType: 'SERVICE',
            serviceType: 'SEWING',
            widthCm: 160,
            heightCm: 260,
            quantity: 60,
            pleatType: 'pinch',
            notes: '3-pass blackout fabric supplied by buyer.',
          },
        },
      },
    })
  }

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
