// Homepage AI chat. Two layers:
//  1. Deterministic intent parsing (Turkish + English): when the message
//     describes a concrete need (service, quantity, city…), the real matching
//     engine runs and ranked providers are returned as structured data.
//  2. Free-form conversation: delegated to the configured LLM provider when
//     available, otherwise a guided slot-filling assistant answers in Turkish.

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAiProvider } from '@/lib/ai'
import { getProducts, getProviders } from '@/lib/data'
import { formatTRY } from '@/lib/format'
import { CITY_COORDS } from '@/lib/demo-data'
import { matchProviders, type MatchRequest } from '@/lib/matching'
import { answerPlatformQuestion, buildPlatformContext } from '@/lib/platform-qa'
import type { ServiceType } from '@/lib/types'

export const dynamic = 'force-dynamic'

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(4000),
      }),
    )
    .min(1)
    .max(40),
})

const SERVICE_KEYWORDS: [RegExp, ServiceType, string][] = [
  [/dikim|diktir|dikiş|dik(?:mek)?|konfeksiyon|sew/i, 'SEWING', 'perde dikimi'],
  [/montaj|kurulum|tak(?:tır|ıl)|asma|install/i, 'INSTALLATION', 'montaj'],
  [/ölçü|ölçüm|measure/i, 'MEASUREMENT', 'ölçüm'],
  [/tasarım|dizayn|design/i, 'DESIGN', 'tasarım'],
  [/pile|pili|pleat/i, 'PLEATING', 'pile'],
  [/nakış|işleme|embroider/i, 'EMBROIDERY', 'nakış'],
  [/motor|otomasyon|akıllı perde/i, 'MOTORIZATION', 'motorlu sistem'],
]

interface ParsedIntent {
  serviceType?: ServiceType
  serviceLabel?: string
  quantity?: number
  widthCm?: number
  heightCm?: number
  city?: string
  neededInDays?: number
  budgetMax?: number
}

function trLower(s: string): string {
  return s.replaceAll('İ', 'i').replaceAll('I', 'ı').toLowerCase()
}

function parseIntent(text: string): ParsedIntent {
  const lower = trLower(text)
  const intent: ParsedIntent = {}

  for (const [re, type, label] of SERVICE_KEYWORDS) {
    if (re.test(text)) {
      intent.serviceType = type
      intent.serviceLabel = label
      break
    }
  }

  const qty = lower.match(/(\d+)\s*(adet|tane|panel|kanat|takım)/)
  if (qty) intent.quantity = parseInt(qty[1], 10)

  const dims = lower.match(/(\d{2,3})\s*[x×*]\s*(\d{2,3})/)
  if (dims) {
    intent.widthCm = parseInt(dims[1], 10)
    intent.heightCm = parseInt(dims[2], 10)
  }

  const days = lower.match(/(\d+)\s*gün/)
  if (days) intent.neededInDays = parseInt(days[1], 10)
  const weeks = lower.match(/(\d+)\s*hafta/)
  if (!days && weeks) intent.neededInDays = parseInt(weeks[1], 10) * 7

  const budget = lower.match(/(\d[\d.]*)\s*(₺|tl|lira|\$|dolar|usd)/)
  if (budget) intent.budgetMax = parseFloat(budget[1].replaceAll('.', ''))

  for (const city of Object.keys(CITY_COORDS)) {
    if (lower.includes(city)) {
      intent.city = city
      break
    }
  }

  // Installation jobs are often quoted per meter of rail rather than panels.
  const meters = lower.match(/(\d+)\s*(metre|m)\b/)
  if (!intent.quantity && meters && intent.serviceType === 'INSTALLATION') {
    intent.quantity = parseInt(meters[1], 10)
  }

  return intent
}

function capitalizeTr(city: string): string {
  return city.charAt(0).toUpperCase() + city.slice(1)
}

const GREETING =
  'Merhaba! Ben CurtainOS asistanıyım. Perde dikimi, montaj, ölçüm, tasarım gibi ihtiyaçlarınız için ' +
  'ağımızdaki en uygun üreticiyi bulabilirim. Örneğin: "İstanbul\'a 21 gün içinde 60 adet 160x260 ' +
  'karartma perde diktirmek istiyorum" yazmanız yeterli.'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = chatSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 })
  }
  const messages = parsed.data.messages
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')!

  // Merge intent across the whole conversation so slot-filling works turn by turn.
  const intent: ParsedIntent = {}
  for (const m of messages) {
    if (m.role !== 'user') continue
    Object.assign(
      intent,
      Object.fromEntries(Object.entries(parseIntent(m.content)).filter(([, v]) => v !== undefined)),
    )
  }

  // A concrete, matchable request: run the engine.
  if (intent.serviceType && intent.city && (intent.quantity || intent.serviceType !== 'SEWING')) {
    const req: MatchRequest = {
      serviceType: intent.serviceType,
      widthCm: intent.widthCm ?? 150,
      heightCm: intent.heightCm ?? 260,
      quantity: intent.quantity ?? 1,
      deliveryCity: intent.city,
      neededInDays: intent.neededInDays,
      budgetMax: intent.budgetMax,
    }
    const providers = await getProviders()
    const results = matchProviders(providers, req)

    if (results.length === 0) {
      return NextResponse.json({
        data: {
          reply: `Üzgünüm, ${capitalizeTr(intent.city)} çevresinde "${intent.serviceLabel}" hizmeti veren bir sağlayıcı bulamadım. Farklı bir hizmet veya şehir deneyebilirsiniz.`,
          matches: [],
        },
      })
    }

    const top = results[0]
    const assumptions: string[] = []
    if (!intent.widthCm) assumptions.push('ölçü 150x260 cm varsayıldı')
    if (!intent.quantity && intent.serviceType === 'SEWING') assumptions.push('1 adet varsayıldı')

    const reply =
      `${capitalizeTr(intent.city)} için ${intent.serviceLabel} talebinizi ${results.length} sağlayıcıyla eşleştirdim` +
      (assumptions.length ? ` (${assumptions.join(', ')})` : '') +
      `. En iyi eşleşme **${top.provider.name}** — tahmini ${formatTRY(top.estimatedPrice)}, ` +
      `${top.estimatedLeadTimeDays} gün teslim, ${top.distanceKm} km mesafe. Detaylar aşağıda:`

    return NextResponse.json({
      data: {
        reply,
        matches: results.slice(0, 4).map((r) => ({
          rank: r.rank,
          totalScore: r.totalScore,
          estimatedPrice: r.estimatedPrice,
          estimatedLeadTimeDays: r.estimatedLeadTimeDays,
          distanceKm: r.distanceKm,
          provider: {
            id: r.provider.id,
            name: r.provider.name,
            city: r.provider.city,
            verified: r.provider.verified,
            ratingAvg: r.provider.ratingAvg,
            ratingCount: r.provider.ratingCount,
            roles: r.provider.roles,
          },
        })),
      },
    })
  }

  // Partial intent: ask for what's missing (slot filling).
  if (intent.serviceType) {
    const missing: string[] = []
    if (!intent.city) missing.push('hangi şehre teslim edileceğini')
    if (!intent.quantity && intent.serviceType === 'SEWING') missing.push('kaç adet olduğunu')
    if (missing.length) {
      return NextResponse.json({
        data: {
          reply: `${capitalizeTr(intent.serviceLabel ?? '')} talebinizi aldım. En iyi eşleşmeyi bulabilmem için ${missing.join(' ve ')} da yazar mısınız? Ölçü ve termin (örn. "160x260, 21 gün içinde") eklerseniz skorlama daha isabetli olur.`,
          matches: [],
        },
      })
    }
  }

  // Serbest sohbet / platform soruları — veri her iki katmanda da kullanılır.
  const [allProviders, allProducts] = await Promise.all([getProviders(), getProducts()])

  // AI yapılandırılmışsa: platform verisiyle beslenmiş LLM her soruyu yanıtlar.
  const ai = getAiProvider()
  if (ai) {
    try {
      const reply = await ai.complete({
        system:
          'Sen CurtainOS asistanısın: perde sektörü için B2B bir platformun ana sayfa sohbet asistanı. ' +
          'Perakendecilere üretici, dikim atölyesi, kumaş tedarikçisi ve montaj ekibi bulmakta yardım edersin. ' +
          'Türkçe, kısa ve net yanıt ver. Platform hakkındaki soruları (üreticiler, puanlar, fiyatlar, ürünler) ' +
          'yalnızca aşağıdaki veriye dayanarak yanıtla; veri dışında uydurma. Somut bir eşleştirme talebi ' +
          '(hizmet + şehir + adet) alırsan kullanıcıyı bu bilgileri tek mesajda yazmaya yönlendir; ' +
          'eşleştirmeyi platform motoru yapar.\n\n' +
          buildPlatformContext(allProviders, allProducts),
        prompt: messages.map((m) => `${m.role === 'user' ? 'Kullanıcı' : 'Asistan'}: ${m.content}`).join('\n'),
        maxTokens: 512,
      })
      return NextResponse.json({ data: { reply, matches: [] } })
    } catch {
      // fall through to the deterministic layers below
    }
  }

  // AI yoksa (veya hata verdiyse): sık sorulan platform sorularına deterministik yanıt.
  const qa = answerPlatformQuestion(lastUser.content, allProviders, allProducts)
  if (qa) {
    return NextResponse.json({ data: { reply: qa, matches: [] } })
  }

  const isGreeting = /merhaba|selam|hello|hi|nasılsın/i.test(lastUser.content)
  return NextResponse.json({
    data: {
      reply: isGreeting
        ? GREETING
        : 'Size en iyi şekilde yardımcı olabilmem için ihtiyacınızı biraz açar mısınız? ' +
          'Örneğin: "Ankara\'ya 2 hafta içinde 40 adet 140x250 tül perde diktirmek istiyorum" veya ' +
          '"İzmir\'de 25 metre ray montajı için usta arıyorum". Dikim, montaj, ölçüm, tasarım, pile, nakış ve ' +
          'motorlu sistem hizmetlerinde eşleştirme yapabilirim.',
      matches: [],
    },
  })
}
