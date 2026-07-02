import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getProviders, isDbAvailable } from '@/lib/data'
import { prisma } from '@/lib/db'
import { aiMatchSummary, matchProviders, ENGINE_VERSION } from '@/lib/matching'

export const dynamic = 'force-dynamic'

const matchRequestSchema = z.object({
  serviceType: z.enum([
    'SEWING',
    'INSTALLATION',
    'MEASUREMENT',
    'DESIGN',
    'PLEATING',
    'EMBROIDERY',
    'MOTORIZATION',
    'LOGISTICS',
  ]),
  widthCm: z.number().positive().max(2000),
  heightCm: z.number().positive().max(2000),
  quantity: z.number().int().positive().max(100_000),
  deliveryCity: z.string().min(1).max(120),
  deliveryLat: z.number().min(-90).max(90).optional(),
  deliveryLng: z.number().min(-180).max(180).optional(),
  neededInDays: z.number().int().positive().max(365).optional(),
  budgetMax: z.number().positive().optional(),
  /** Persist as an RFQ + match results when a database is connected. */
  rfqTitle: z.string().max(200).optional(),
  buyerOrgId: z.string().optional(),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = matchRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid match request', issues: parsed.error.issues },
      { status: 400 },
    )
  }
  const req = parsed.data

  const providers = await getProviders()
  const results = matchProviders(providers, req)
  const aiSummary = await aiMatchSummary(results, req)

  // Persist RFQ + match results when running against a live database.
  let rfqId: string | null = null
  if (req.rfqTitle && req.buyerOrgId && (await isDbAvailable())) {
    try {
      const rfq = await prisma.rfq.create({
        data: {
          buyerOrgId: req.buyerOrgId,
          title: req.rfqTitle,
          status: 'MATCHED',
          deliveryCity: req.deliveryCity,
          deliveryCountry: 'Türkiye',
          deliveryLat: req.deliveryLat,
          deliveryLng: req.deliveryLng,
          neededBy: req.neededInDays
            ? new Date(Date.now() + req.neededInDays * 86_400_000)
            : undefined,
          budgetMax: req.budgetMax,
          items: {
            create: {
              itemType: 'SERVICE',
              serviceType: req.serviceType,
              widthCm: req.widthCm,
              heightCm: req.heightCm,
              quantity: req.quantity,
            },
          },
          matches: {
            create: results.map((r) => ({
              providerOrgId: r.provider.id,
              rank: r.rank,
              totalScore: r.totalScore,
              priceScore: r.scores.price,
              deliveryScore: r.scores.delivery,
              capacityScore: r.scores.capacity,
              wasteScore: r.scores.waste,
              logisticsScore: r.scores.logistics,
              ratingScore: r.scores.rating,
              estimatedPrice: r.estimatedPrice,
              estimatedLeadTimeDays: r.estimatedLeadTimeDays,
              explanation: r.explanation,
              engineVersion: ENGINE_VERSION,
            })),
          },
        },
      })
      rfqId = rfq.id
    } catch {
      // Persistence is best-effort; the match itself already succeeded.
    }
  }

  return NextResponse.json({
    data: {
      engineVersion: ENGINE_VERSION,
      rfqId,
      aiSummary,
      results: results.map((r) => ({
        rank: r.rank,
        totalScore: r.totalScore,
        scores: r.scores,
        estimatedPrice: r.estimatedPrice,
        estimatedLeadTimeDays: r.estimatedLeadTimeDays,
        distanceKm: r.distanceKm,
        explanation: r.explanation,
        provider: {
          id: r.provider.id,
          name: r.provider.name,
          slug: r.provider.slug,
          city: r.provider.city,
          country: r.provider.country,
          roles: r.provider.roles,
          verified: r.provider.verified,
          ratingAvg: r.provider.ratingAvg,
          ratingCount: r.provider.ratingCount,
        },
      })),
    },
  })
}
