/** Fiyat gösterimi: ₺12.500 biçiminde, kuruşsuz. */
export function formatTRY(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amount)
}

const SALES_TIERS = [50000, 25000, 10000, 5000, 2500, 1000, 500, 100]

/**
 * Satış adedini kademeli gösterir: 242 → "100+", 1250 → "1000+", 60 → "60".
 * Kademeler: 100 / 500 / 1000 / 2500 / 5000 / 10000 / 25000 / 50000.
 */
export function formatSalesTier(count: number): string {
  const tier = SALES_TIERS.find((t) => count >= t)
  return tier ? `${tier.toLocaleString('tr-TR')}+` : String(count)
}
