// Platform bilgi soruları için iki yardımcı:
//  - buildPlatformContext: AI sağlayıcısına verilecek özet platform verisi
//    (üreticiler, puanlar, ürünler, fiyatlar) — AI her soruyu bununla yanıtlar.
//  - answerPlatformQuestion: AI anahtarı YOKKEN de çalışan deterministik
//    soru-cevap (en yüksek puan, fiyat, üretici listesi, sayılar…).

import { formatSalesTier, formatTRY } from '@/lib/format'
import { CATEGORY_LABELS, ROLE_LABELS, SERVICE_LABELS } from '@/lib/labels'
import type { ProductSummary, Provider } from '@/lib/types'

function trLower(s: string): string {
  return s.replaceAll('İ', 'i').replaceAll('I', 'ı').toLowerCase()
}

export function buildPlatformContext(providers: Provider[], products: ProductSummary[]): string {
  const lines: string[] = ['PLATFORM VERİSİ (güncel):']
  for (const p of providers) {
    const roles = p.roles.map((r) => ROLE_LABELS[r]).join(', ')
    const servs = [...new Set(p.services.map((s) => SERVICE_LABELS[s.type]))].join(', ')
    const prods = products
      .filter((x) => x.orgId === p.id)
      .map((x) => `${x.name} (${CATEGORY_LABELS[x.category]}, ${formatTRY(x.basePrice)}'den başlayan, ${x.leadTimeDays} gün termin)`)
      .join('; ')
    lines.push(
      `- ${p.name} — ${p.city}${p.verified ? ' (doğrulanmış)' : ''} · ${roles} · puan ${p.ratingAvg.toFixed(1)} (${p.ratingCount} değerlendirme) · satış ${p.salesCount !== undefined ? formatSalesTier(p.salesCount) : 'bilinmiyor'}` +
        (servs ? ` · hizmetler: ${servs}` : '') +
        (prods ? ` · ürünler: ${prods}` : ''),
    )
  }
  lines.push(`Toplam üretici/sağlayıcı sayısı: ${providers.length}. Toplam ürün sayısı: ${products.length}.`)
  return lines.join('\n')
}

export function answerPlatformQuestion(
  text: string,
  providers: Provider[],
  products: ProductSummary[],
): string | null {
  const lower = trLower(text)
  const asksQuestion = /\?|kim|hangi|kaç|nedir|ne kadar|listele|göster|en (iyi|yüksek|ucuz|pahalı|hızlı)/.test(lower)
  if (!asksQuestion) return null

  // En yüksek puanlı / en iyi üretici
  if (/en (iyi|yüksek|kaliteli)/.test(lower) && /(üretici|firma|sağlayıcı|puan|atölye)/.test(lower)) {
    const top = [...providers].sort(
      (a, b) => b.ratingAvg - a.ratingAvg || (b.salesCount ?? 0) - (a.salesCount ?? 0),
    )[0]
    if (!top) return null
    return (
      `En yüksek puanlı üretici **${top.name}** (${top.city}) — ${top.ratingAvg.toFixed(1)} puan, ` +
      `${top.ratingCount} değerlendirme${top.salesCount !== undefined ? `, ${formatSalesTier(top.salesCount)} site içi satış` : ''}. ` +
      `Detaylar için Üreticiler sayfasından profiline bakabilirsiniz.`
    )
  }

  // En ucuz / en pahalı ürün
  if (/en (ucuz|uygun|pahalı)/.test(lower)) {
    const sorted = [...products].sort((a, b) => a.basePrice - b.basePrice)
    const pick = /pahalı/.test(lower) ? sorted[sorted.length - 1] : sorted[0]
    if (!pick) return null
    return `${/pahalı/.test(lower) ? 'En yüksek' : 'En uygun'} başlangıç fiyatlı ürün **${pick.name}** — ${pick.orgName}, ${formatTRY(pick.basePrice)}'den başlayan fiyatlarla (${pick.leadTimeDays} gün termin).`
  }

  // Kaç üretici / kaç ürün
  if (/kaç/.test(lower)) {
    if (/(üretici|firma|sağlayıcı|üye|atölye)/.test(lower)) {
      return `Platformda şu anda **${providers.length} üretici/sağlayıcı** kayıtlı. Tümünü Üreticiler sayfasında görebilirsiniz.`
    }
    if (/ürün/.test(lower)) {
      return `Platformda şu anda **${products.length} ürün** listeleniyor.`
    }
  }

  // Fiyat soruları — ürün adı/kategorisi geçiyorsa
  if (/(fiyat|ne kadar|kaça|ücret)/.test(lower)) {
    const hit = products.find(
      (p) =>
        lower.includes(trLower(p.name).split(' ')[0]) ||
        lower.includes(trLower(CATEGORY_LABELS[p.category])),
    )
    if (hit) {
      return (
        `**${hit.name}** (${hit.orgName}) ${formatTRY(hit.basePrice)}'den başlayan fiyatlarla, ` +
        `${hit.leadTimeDays} gün terminle üretiliyor. Ölçünüze özel net fiyat için ürün sayfasındaki yapılandırıcıyı kullanabilirsiniz.`
      )
    }
  }

  // Üretici listesi
  if (/(üretici|firma|sağlayıcı)ler(i)?\s*(kim|neler|listele|göster)|kimler var/.test(lower)) {
    const names = providers.map((p) => `${p.name} (${p.city}, ${p.ratingAvg.toFixed(1)}★)`).join(' · ')
    return `Platformdaki üretici ve sağlayıcılar: ${names}.`
  }

  // Belirli bir üretici hakkında soru
  for (const p of providers) {
    if (lower.includes(trLower(p.name).split(' ')[0])) {
      const prods = products.filter((x) => x.orgId === p.id)
      return (
        `**${p.name}** — ${p.city}${p.verified ? ', doğrulanmış üye' : ''}. ` +
        `Puan: ${p.ratingAvg.toFixed(1)} (${p.ratingCount} değerlendirme)${p.salesCount !== undefined ? `, ${formatSalesTier(p.salesCount)} site içi satış` : ''}. ` +
        (prods.length
          ? `Ürünleri: ${prods.map((x) => `${x.name} (${formatTRY(x.basePrice)}'den başlayan)`).join(', ')}.`
          : '')
      )
    }
  }

  return null
}
