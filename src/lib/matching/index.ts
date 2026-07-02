// AI matching engine: scores provider organizations against an RFQ across six
// dimensions — price, delivery time, production capacity, fabric-waste
// optimization, logistics distance, and supplier rating. Scoring is
// deterministic and auditable; the optional LLM layer (src/lib/ai) only adds
// natural-language explanations on top.

import { CITY_COORDS } from '../demo-data'
import { getAiProvider } from '../ai'
import type { Provider, ServiceType } from '../types'

export const ENGINE_VERSION = '1.0.0'

export interface MatchRequest {
  serviceType: ServiceType
  widthCm: number
  heightCm: number
  quantity: number
  deliveryCity: string
  deliveryLat?: number
  deliveryLng?: number
  /** Days until the goods/services are needed. */
  neededInDays?: number
  budgetMax?: number
  weights?: Partial<MatchWeights>
}

export interface MatchWeights {
  price: number
  delivery: number
  capacity: number
  waste: number
  logistics: number
  rating: number
}

export const DEFAULT_WEIGHTS: MatchWeights = {
  price: 0.25,
  delivery: 0.2,
  capacity: 0.15,
  waste: 0.15,
  logistics: 0.15,
  rating: 0.1,
}

export interface MatchScore {
  provider: Provider
  rank: number
  totalScore: number
  scores: {
    price: number
    delivery: number
    capacity: number
    waste: number
    logistics: number
    rating: number
  }
  estimatedPrice: number
  estimatedLeadTimeDays: number
  distanceKm: number
  explanation: string
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

/** Estimate the total price a provider would charge for the request. */
export function estimatePrice(provider: Provider, req: MatchRequest): number | null {
  const service = provider.services.find((s) => s.type === req.serviceType)
  if (!service) return null

  const sqmPerPanel = (req.widthCm / 100) * (req.heightCm / 100)
  let unitPrice: number
  switch (service.pricingModel) {
    case 'PER_PANEL':
      unitPrice = service.basePrice
      break
    case 'PER_METER':
      unitPrice = service.basePrice * (req.widthCm / 100)
      break
    case 'PER_SQM':
      unitPrice = service.basePrice * sqmPerPanel
      break
    case 'PER_HOUR':
      // Rough industry heuristic: ~0.75h of work per panel.
      unitPrice = service.basePrice * 0.75
      break
    case 'FIXED':
      unitPrice = service.basePrice / Math.max(req.quantity, 1)
      break
    default:
      unitPrice = service.basePrice
  }

  let total = unitPrice * req.quantity

  // Apply the provider's active pricing rules (volume discounts, rush fees).
  for (const rule of provider.pricingRules ?? []) {
    if (rule.type === 'VOLUME_DISCOUNT' && req.quantity >= (rule.params.minQty ?? Infinity)) {
      total *= 1 - (rule.params.discountPct ?? 0) / 100
    }
    if (
      rule.type === 'RUSH_FEE' &&
      req.neededInDays !== undefined &&
      req.neededInDays <= (rule.params.maxLeadDays ?? 0)
    ) {
      total *= 1 + (rule.params.feePct ?? 0) / 100
    }
  }

  if (service.minCharge && total < service.minCharge) total = service.minCharge
  return Math.round(total * 100) / 100
}

// ---------------------------------------------------------------------------
// Individual dimension scores (each normalized to 0..1)
// ---------------------------------------------------------------------------

function scorePrice(estimate: number, bestEstimate: number, budgetMax?: number): number {
  // Relative to the cheapest candidate; over-budget quotes are penalized hard.
  let score = bestEstimate / estimate
  if (budgetMax !== undefined && estimate > budgetMax) score *= 0.4
  return clamp01(score)
}

function scoreDelivery(leadTimeDays: number, neededInDays?: number): number {
  if (neededInDays === undefined) {
    // No deadline: shorter is still better, on a soft curve (7 days → ~0.66).
    return clamp01(1 / (1 + leadTimeDays / 14))
  }
  if (leadTimeDays > neededInDays) return 0.05 // would miss the deadline
  // Full score at ≤ half the available window, tapering to 0.5 at the deadline.
  const slack = neededInDays / 2
  if (leadTimeDays <= slack) return 1
  return clamp01(1 - 0.5 * ((leadTimeDays - slack) / slack))
}

function scoreCapacity(provider: Provider, quantity: number): number {
  if (!provider.capacity) return 0.5 // unknown capacity — neutral
  const available = provider.capacity.capacityUnits - provider.capacity.bookedUnits
  if (available <= 0) return 0
  return clamp01(available / (quantity * 2)) // full score at 2× headroom
}

/**
 * Fabric-waste optimization: how efficiently the requested panel width cuts
 * from the provider's fabric roll widths. Uses the best roll available.
 */
function scoreWaste(provider: Provider, widthCm: number): number {
  const rolls = provider.fabricRollWidthsCm
  if (!rolls?.length || widthCm <= 0) return 0.5 // not applicable — neutral
  let best = 0
  for (const roll of rolls) {
    const panelsAcross = Math.floor(roll / widthCm)
    const utilization =
      panelsAcross >= 1
        ? (panelsAcross * widthCm) / roll
        : // Panel wider than the roll: railroaded cutting, moderate waste.
          0.6 * (roll / widthCm)
    best = Math.max(best, clamp01(utilization))
  }
  return best
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(a)))
}

function scoreLogistics(distanceKm: number, serviceRadiusKm?: number): number {
  if (serviceRadiusKm !== undefined && distanceKm > serviceRadiusKm) return 0 // out of range
  // 1.0 at 0 km, ~0.5 at 400 km, approaching 0 past 1500 km.
  return clamp01(1 / (1 + distanceKm / 400))
}

function scoreRating(provider: Provider): number {
  if (provider.ratingCount === 0) return 0.5 // no reviews — neutral
  const confidence = Math.min(provider.ratingCount / 20, 1)
  const normalized = provider.ratingAvg / 5
  // Blend toward neutral 0.5 when few reviews exist.
  return clamp01(0.5 + (normalized - 0.5) * confidence)
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function matchProviders(providers: Provider[], req: MatchRequest): MatchScore[] {
  const weights: MatchWeights = { ...DEFAULT_WEIGHTS, ...req.weights }
  const delivery = resolveDeliveryCoords(req)

  const candidates = providers
    .map((provider) => {
      const service = provider.services.find((s) => s.type === req.serviceType)
      if (!service) return null
      const estimate = estimatePrice(provider, req)
      if (estimate === null) return null
      const distanceKm = delivery
        ? haversineKm(provider.lat, provider.lng, delivery.lat, delivery.lng)
        : 300 // unknown destination — assume mid-range
      return { provider, service, estimate, distanceKm }
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)

  if (candidates.length === 0) return []

  const bestEstimate = Math.min(...candidates.map((c) => c.estimate))

  const scored = candidates.map(({ provider, service, estimate, distanceKm }) => {
    const scores = {
      price: scorePrice(estimate, bestEstimate, req.budgetMax),
      delivery: scoreDelivery(service.leadTimeDays, req.neededInDays),
      capacity: scoreCapacity(provider, req.quantity),
      waste: scoreWaste(provider, req.widthCm),
      logistics: scoreLogistics(distanceKm, service.serviceRadiusKm),
      rating: scoreRating(provider),
    }
    const totalScore =
      scores.price * weights.price +
      scores.delivery * weights.delivery +
      scores.capacity * weights.capacity +
      scores.waste * weights.waste +
      scores.logistics * weights.logistics +
      scores.rating * weights.rating

    return {
      provider,
      rank: 0,
      totalScore: round3(totalScore),
      scores: {
        price: round3(scores.price),
        delivery: round3(scores.delivery),
        capacity: round3(scores.capacity),
        waste: round3(scores.waste),
        logistics: round3(scores.logistics),
        rating: round3(scores.rating),
      },
      estimatedPrice: estimate,
      estimatedLeadTimeDays: service.leadTimeDays,
      distanceKm,
      explanation: '',
    } satisfies MatchScore
  })

  scored.sort((a, b) => b.totalScore - a.totalScore)
  scored.forEach((s, i) => {
    s.rank = i + 1
    s.explanation = deterministicExplanation(s, req)
  })
  return scored
}

function deterministicExplanation(s: MatchScore, req: MatchRequest): string {
  const parts: string[] = []
  if (s.scores.price >= 0.9) parts.push('en iyi fiyat')
  else if (s.scores.price >= 0.7) parts.push('rekabetçi fiyat')
  if (s.scores.delivery >= 0.9) parts.push(`rahat ${s.estimatedLeadTimeDays} günlük termin`)
  else if (s.scores.delivery <= 0.1) parts.push('termini kaçırma riski yüksek')
  if (s.scores.capacity >= 0.9) parts.push('bol boş kapasite')
  else if (s.scores.capacity <= 0.2) parts.push('sıkışık üretim kapasitesi')
  if (s.scores.waste >= 0.9) parts.push(`${req.widthCm} cm paneller için verimli kumaş kullanımı`)
  if (s.scores.logistics >= 0.8) parts.push(`${req.deliveryCity} şehrine yakın (${s.distanceKm} km)`)
  else if (s.scores.logistics <= 0.2) parts.push(`teslimat noktasına uzak (${s.distanceKm} km)`)
  if (s.scores.rating >= 0.85) parts.push(`güçlü puan (${s.provider.ratingAvg}/5)`)
  return parts.length
    ? `${s.provider.name}: ${parts.join(', ')}.`
    : `${s.provider.name}: tüm kriterlerde dengeli.`
}

/**
 * Optional AI summary over the ranked results. Returns null when no AI
 * provider is configured — callers should simply omit the summary then.
 */
export async function aiMatchSummary(
  results: MatchScore[],
  req: MatchRequest,
): Promise<string | null> {
  const ai = getAiProvider()
  if (!ai || results.length === 0) return null
  const top = results.slice(0, 3).map((r) => ({
    name: r.provider.name,
    city: r.provider.city,
    totalScore: r.totalScore,
    scores: r.scores,
    estimatedPrice: r.estimatedPrice,
    leadTimeDays: r.estimatedLeadTimeDays,
    distanceKm: r.distanceKm,
  }))
  try {
    return await ai.complete({
      system:
        'You are the matching assistant of a B2B curtain-industry platform. ' +
        'Given scored provider candidates for a request, write a concise (max 120 words) ' +
        'recommendation for a procurement manager: who to pick and why, plus one risk to watch.',
      prompt: JSON.stringify({ request: req, topCandidates: top }),
      maxTokens: 512,
    })
  } catch {
    return null // AI is additive — never fail the match because of it
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveDeliveryCoords(req: MatchRequest): { lat: number; lng: number } | null {
  if (req.deliveryLat !== undefined && req.deliveryLng !== undefined) {
    return { lat: req.deliveryLat, lng: req.deliveryLng }
  }
  return CITY_COORDS[req.deliveryCity.trim().toLowerCase()] ?? null
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}
