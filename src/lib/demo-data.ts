// Realistic demo dataset. Used two ways:
//  1. As the in-memory fallback when no live PostgreSQL is reachable ("demo mode").
//  2. As the source for prisma/seed.ts, so demo mode and a seeded DB match.

import type {
  FabricSummary,
  OrderSummary,
  ProductSummary,
  Provider,
} from './types'

export const DEMO_PROVIDERS: Provider[] = [
  {
    id: 'org-carra-woods',
    name: 'Carra Woods',
    slug: 'carra-woods',
    description: 'Hücreli (petek) perde uzmanı üretici — ölçüye özel üretim, 7-14 iş gününde sevkiyat.',
    about:
      'Carra Woods, hücreli (petek) ve Roman perdede uzmanlaşmış bir üreticidir. Tüm üretim ' +
      'ölçüye özeldir: kesim, konfeksiyon ve kalite kontrol tek çatı altında yapılır, siparişler ' +
      '7-14 iş gününde sevkiyata hazırlanır. Petek yapılı kumaşlarla ısı ve ses yalıtımına, Roman ' +
      'serisinde ise dört farklı pile stili ve geniş kumaş koleksiyonlarına odaklanır. İpsiz, ' +
      'zincirli ve motorlu mekanizma seçeneklerinin tamamı kendi atölyesinde monte edilir; her ' +
      'perde tam uyum garantisiyle gönderilir.',
    salesCount: 1250,
    catalogs: [
      {
        title: 'LUMIA Cellular Shades Kataloğu 2025',
        file: '/catalogs/lumia-cellular-shades-2025.pdf',
        pages: 181,
        sizeMB: 18,
      },
    ],
    roles: ['MANUFACTURER'],
    city: 'Istanbul',
    country: 'Türkiye',
    lat: 41.0451,
    lng: 28.895,
    verified: true,
    ratingAvg: 4.9,
    ratingCount: 1050,
    services: [
      { type: 'SEWING', title: 'Hücreli perde üretimi', pricingModel: 'PER_PANEL', basePrice: 3600, leadTimeDays: 10 },
      { type: 'MOTORIZATION', title: 'Motorlu sistem entegrasyonu', pricingModel: 'FIXED', basePrice: 7500, leadTimeDays: 12 },
    ],
    capacity: { capacityUnits: 600, bookedUnits: 210, unit: 'panels' },
    fabricRollWidthsCm: [300],
  },
  {
    id: 'org-atlas',
    name: 'Atlas Curtain Manufacturing',
    slug: 'atlas-curtain-manufacturing',
    description: 'Tam kapsamlı perde üreticisi: kesim, dikim, pile ve finisaj — yüksek kapasiteli üretim.',
    about:
      'Atlas Curtain Manufacturing, otel ve konut projeleri için yüksek kapasiteli perde üretimi ' +
      'yapar. Kesimden finisaja tüm hat kendi tesisindedir; haftalık 1.200 panel kapasitesiyle ' +
      'büyük projelerde öngörülebilir termin sunar.',
    salesCount: 4800,
    roles: ['MANUFACTURER', 'SEWING_WORKSHOP'],
    city: 'Bursa',
    country: 'Türkiye',
    lat: 40.1885,
    lng: 29.061,
    verified: true,
    ratingAvg: 4.7,
    ratingCount: 128,
    services: [
      { type: 'SEWING', title: 'Endüstriyel perde dikimi', pricingModel: 'PER_PANEL', basePrice: 560, leadTimeDays: 5 },
      { type: 'PLEATING', title: 'Pile & dalga pile', pricingModel: 'PER_METER', basePrice: 140, leadTimeDays: 3 },
    ],
    capacity: { capacityUnits: 1200, bookedUnits: 780, unit: 'panels' },
    fabricRollWidthsCm: [280, 300, 320],
    pricingRules: [
      { type: 'VOLUME_DISCOUNT', name: '50+ panels', params: { minQty: 50, discountPct: 8 } },
      { type: 'RUSH_FEE', name: 'Under 4 days', params: { maxLeadDays: 4, feePct: 15 } },
    ],
  },
  {
    id: 'org-denizli',
    name: 'Denizli Textile Works',
    slug: 'denizli-textile-works',
    description: 'Üçüncü kuşak tekstil üreticisi; tül, vual ve karartma serilerinde uzman.',
    about:
      'Denizli Textile Works, üç kuşaktır tül ve vual dokumacılığı yapan bir aile işletmesidir. ' +
      'Kendi dokuma tezgâhlarında ürettiği kumaşları konfeksiyonuyla birleştirir; özellikle ' +
      'nakışlı tül ve karartma serilerinde geniş bir arşive sahiptir.',
    salesCount: 2900,
    roles: ['MANUFACTURER', 'FABRIC_SUPPLIER'],
    city: 'Denizli',
    country: 'Türkiye',
    lat: 37.7765,
    lng: 29.0864,
    verified: true,
    ratingAvg: 4.5,
    ratingCount: 86,
    services: [
      { type: 'SEWING', title: 'Tül & şifon konfeksiyon', pricingModel: 'PER_PANEL', basePrice: 440, leadTimeDays: 7 },
    ],
    capacity: { capacityUnits: 900, bookedUnits: 310, unit: 'panels' },
    fabricRollWidthsCm: [300],
    pricingRules: [
      { type: 'VOLUME_DISCOUNT', name: '100+ panels', params: { minQty: 100, discountPct: 12 } },
    ],
  },
  {
    id: 'org-marmara',
    name: 'Marmara Sewing Atelier',
    slug: 'marmara-sewing-atelier',
    description: 'Ölçüye özel ve premium finisaj işleri için butik dikim atölyesi.',
    about:
      'Marmara Sewing Atelier, ölçüye özel ve premium finisaj isteyen işler için çalışan butik ' +
      'bir dikim atölyesidir. Küçük partilerde yüksek işçilik kalitesine odaklanır; özel nakış ' +
      've el işçiliği gerektiren projelerde tercih edilir.',
    salesCount: 640,
    roles: ['SEWING_WORKSHOP'],
    city: 'Istanbul',
    country: 'Türkiye',
    lat: 41.0082,
    lng: 28.9784,
    verified: true,
    ratingAvg: 4.9,
    ratingCount: 54,
    services: [
      { type: 'SEWING', title: 'Ölçüye özel dikim', pricingModel: 'PER_PANEL', basePrice: 760, minCharge: 2400, leadTimeDays: 3 },
      { type: 'EMBROIDERY', title: 'Özel nakış işleme', pricingModel: 'PER_HOUR', basePrice: 1000, leadTimeDays: 4 },
    ],
    capacity: { capacityUnits: 220, bookedUnits: 140, unit: 'panels' },
    fabricRollWidthsCm: [280, 300],
  },
  {
    id: 'org-anadolu',
    name: 'Anadolu Confection Co.',
    slug: 'anadolu-confection',
    description: 'Yüksek hacimli ekonomik konfeksiyon; her hafta ek kapasite açığı bulunur.',
    about:
      'Anadolu Confection, toptan ve ekonomik segmentte yüksek hacimli perde konfeksiyonu yapar. ' +
      'Haftalık 1.500 panel kapasitesiyle acil ve büyük partileri hızla karşılar; zebra ve stor ' +
      'serilerinde hazır ürün stoğu tutar.',
    salesCount: 5600,
    roles: ['SEWING_WORKSHOP', 'MANUFACTURER'],
    city: 'Gaziantep',
    country: 'Türkiye',
    lat: 37.0662,
    lng: 37.3833,
    verified: false,
    ratingAvg: 4.1,
    ratingCount: 33,
    services: [
      { type: 'SEWING', title: 'Toptan perde dikimi', pricingModel: 'PER_PANEL', basePrice: 360, leadTimeDays: 9 },
    ],
    capacity: { capacityUnits: 1500, bookedUnits: 400, unit: 'panels' },
    fabricRollWidthsCm: [280],
    pricingRules: [
      { type: 'VOLUME_DISCOUNT', name: '200+ panels', params: { minQty: 200, discountPct: 15 } },
    ],
  },
  {
    id: 'org-ege-install',
    name: 'Ege Installation Team',
    slug: 'ege-installation-team',
    description: 'Ege bölgesi genelinde sertifikalı perde ve stor montajı.',
    about:
      'Ege Installation Team, İzmir merkezli sertifikalı bir montaj ekibidir. 150 km hizmet ' +
      'yarıçapında perde, stor ve ray montajı ile yerinde ölçüm hizmeti verir.',
    salesCount: 1100,
    roles: ['INSTALLER'],
    city: 'Izmir',
    country: 'Türkiye',
    lat: 38.4237,
    lng: 27.1428,
    verified: true,
    ratingAvg: 4.6,
    ratingCount: 71,
    services: [
      { type: 'INSTALLATION', title: 'Ray & perde montajı', pricingModel: 'PER_METER', basePrice: 240, minCharge: 1600, leadTimeDays: 2, serviceRadiusKm: 150 },
      { type: 'MEASUREMENT', title: 'Yerinde ölçüm', pricingModel: 'FIXED', basePrice: 1200, leadTimeDays: 1, serviceRadiusKm: 150 },
    ],
  },
  {
    id: 'org-istanbul-install',
    name: 'Bosphorus Mounting Services',
    slug: 'bosphorus-mounting',
    description: 'Aynı hafta montaj; motorlu sistemlerde uzman ekip.',
    about:
      'Bosphorus Mounting Services, İstanbul içinde aynı hafta montaj sunan bir ekiptir. ' +
      'Motorlu ve akıllı ev entegrasyonlu sistem kurulumlarında uzmanlaşmıştır.',
    salesCount: 900,
    roles: ['INSTALLER'],
    city: 'Istanbul',
    country: 'Türkiye',
    lat: 41.0422,
    lng: 29.0089,
    verified: true,
    ratingAvg: 4.4,
    ratingCount: 95,
    services: [
      { type: 'INSTALLATION', title: 'Perde & stor montajı', pricingModel: 'PER_METER', basePrice: 300, minCharge: 2000, leadTimeDays: 2, serviceRadiusKm: 80 },
      { type: 'MOTORIZATION', title: 'Motorlu ray kurulumu', pricingModel: 'FIXED', basePrice: 4800, leadTimeDays: 4, serviceRadiusKm: 80 },
    ],
  },
  {
    id: 'org-kumasci',
    name: 'Kumaşçı Fabric House',
    slug: 'kumasci-fabric-house',
    description: 'Toptan kumaş tedarikçisi — perdelik, tül ve karartma kumaşta 400+ çeşit.',
    about:
      'Kumaşçı Fabric House, perdelik kumaşta 400\'ü aşkın SKU tutan toptan bir tedarikçidir. ' +
      'Keten, kadife, vual ve karartma gruplarında sürekli stok; metraj bazlı hızlı sevkiyat sağlar.',
    salesCount: 12500,
    roles: ['FABRIC_SUPPLIER'],
    city: 'Istanbul',
    country: 'Türkiye',
    lat: 41.0136,
    lng: 28.955,
    verified: true,
    ratingAvg: 4.3,
    ratingCount: 210,
    services: [],
  },
  {
    id: 'org-studio-perde',
    name: 'Studio Perde Design',
    slug: 'studio-perde-design',
    description: 'İç mekân tekstil tasarım stüdyosu: konsept panoları, 3B önizleme, özel desen.',
    about:
      'Studio Perde Design, iç mekân tekstili odaklı bir tasarım stüdyosudur. Konsept panoları, ' +
      '3B önizleme ve özel desen çalışmalarıyla proje bazlı hizmet verir.',
    salesCount: 180,
    roles: ['CREATIVE_STUDIO'],
    city: 'Ankara',
    country: 'Türkiye',
    lat: 39.9334,
    lng: 32.8597,
    verified: true,
    ratingAvg: 4.8,
    ratingCount: 42,
    services: [
      { type: 'DESIGN', title: 'Perde tasarım paketi', pricingModel: 'FIXED', basePrice: 10000, leadTimeDays: 7 },
    ],
  },
]

export const DEMO_PRODUCTS: ProductSummary[] = [
  { id: 'prod-cellular', orgId: 'org-carra-woods', orgName: 'Carra Woods', name: 'Hücreli Perde (Cellular Shade)', slug: 'cellular-shade', category: 'CELLULAR_SHADE', basePrice: 1929, currency: 'TRY', leadTimeDays: 10, description: 'Petek yapılı, ısı ve ses yalıtımlı; ölçüye özel üretim. Tül geçirgen, ışık süzen ve karartma seçenekleri.' },
  { id: 'prod-roman', orgId: 'org-carra-woods', orgName: 'Carra Woods', name: 'Roman Perde (Roman Shade)', slug: 'roman-shade', category: 'ROMAN_SHADE', basePrice: 5550, currency: 'TRY', leadTimeDays: 12, description: 'Yumuşak kumaş katlı Roman perde; dört pile stili, üç kumaş koleksiyonu, astar seçenekleriyle ölçüye özel üretim.' },
  { id: 'prod-1', orgId: 'org-atlas', orgName: 'Atlas Curtain Manufacturing', name: 'Klasik Pile Perde', slug: 'classic-pinch-pleat', category: 'CURTAIN', basePrice: 3550, currency: 'TRY', leadTimeDays: 7, description: 'Çift pile, astarlı, ölçüye özel üretim.' },
  { id: 'prod-2', orgId: 'org-atlas', orgName: 'Atlas Curtain Manufacturing', name: 'Otel Tipi Karartma Panel', slug: 'hotel-blackout-panel', category: 'BLACKOUT', basePrice: 4750, currency: 'TRY', leadTimeDays: 10, description: '3 katmanlı karartma, güç tutuşur, kontrat sınıfı.' },
  { id: 'prod-3', orgId: 'org-denizli', orgName: 'Denizli Textile Works', name: 'Vual Tül Panel', slug: 'voile-sheer-panel', category: 'SHEER', basePrice: 1800, currency: 'TRY', leadTimeDays: 5, description: 'Tüy hafifliğinde vual, kurşunlu etek dikişi.' },
  { id: 'prod-4', orgId: 'org-denizli', orgName: 'Denizli Textile Works', name: 'Nakışlı Tül', slug: 'embroidered-tulle', category: 'TULLE', basePrice: 2450, currency: 'TRY', leadTimeDays: 8, description: 'Geleneksel nakışlı tül, 300 cm boy.' },
  { id: 'prod-5', orgId: 'org-anadolu', orgName: 'Anadolu Confection Co.', name: 'Gece-Gündüz Zebra Perde', slug: 'day-night-zebra', category: 'ZEBRA_BLIND', basePrice: 1500, currency: 'TRY', leadTimeDays: 6, description: 'Dönüşümlü tül/dolgu bantlar, kaset dahil.' },
  { id: 'prod-6', orgId: 'org-anadolu', orgName: 'Anadolu Confection Co.', name: 'Termal Stor Perde', slug: 'thermal-roller', category: 'ROLLER_BLIND', basePrice: 1650, currency: 'TRY', leadTimeDays: 6, description: 'Termal kaplamalı stor, zincirli veya yaylı mekanizma.' },
]

export const DEMO_FABRICS: FabricSummary[] = [
  { id: 'fab-1', orgId: 'org-kumasci', orgName: 'Kumaşçı Fabric House', name: 'Keten Karışım Natürel', sku: 'KFH-LIN-001', composition: '%55 keten, %45 pamuk', color: 'Natürel', widthCm: 300, pricePerMeter: 500, currency: 'TRY', stockMeters: 850 },
  { id: 'fab-2', orgId: 'org-kumasci', orgName: 'Kumaşçı Fabric House', name: 'Kadife Royal Lacivert', sku: 'KFH-VEL-014', composition: '%100 polyester kadife', color: 'Lacivert', widthCm: 280, pricePerMeter: 720, currency: 'TRY', stockMeters: 420 },
  { id: 'fab-3', orgId: 'org-kumasci', orgName: 'Kumaşçı Fabric House', name: 'Karartma Kaplamalı Beyaz', sku: 'KFH-BLK-007', composition: '3 kat akrilik kaplamalı polyester', color: 'Beyaz', widthCm: 280, pricePerMeter: 390, currency: 'TRY', stockMeters: 1200 },
  { id: 'fab-4', orgId: 'org-denizli', orgName: 'Denizli Textile Works', name: 'Vual Kar Beyazı', sku: 'DTW-VOI-101', composition: '%100 polyester vual', color: 'Kar beyazı', widthCm: 300, pricePerMeter: 170, currency: 'TRY', stockMeters: 3200 },
]

export const DEMO_ORDERS: OrderSummary[] = [
  { id: 'ord-6', orderNumber: 'CO-2026-0144', buyerName: 'Perde Palace (Perakende)', sellerName: 'Carra Woods', status: 'IN_PRODUCTION', total: 78000, currency: 'TRY', placedAt: '2026-06-30', dueDate: '2026-07-14', itemCount: 22 },
  { id: 'ord-1', orderNumber: 'CO-2026-0142', buyerName: 'Perde Palace (Perakende)', sellerName: 'Atlas Curtain Manufacturing', status: 'IN_PRODUCTION', total: 171000, currency: 'TRY', placedAt: '2026-06-24', dueDate: '2026-07-08', itemCount: 48 },
  { id: 'ord-2', orderNumber: 'CO-2026-0141', buyerName: 'HomeStyle Interiors', sellerName: 'Marmara Sewing Atelier', status: 'SHIPPED', total: 45500, currency: 'TRY', placedAt: '2026-06-21', dueDate: '2026-07-01', itemCount: 12 },
  { id: 'ord-3', orderNumber: 'CO-2026-0139', buyerName: 'Perde Palace (Perakende)', sellerName: 'Ege Installation Team', status: 'COMPLETED', total: 15000, currency: 'TRY', placedAt: '2026-06-15', itemCount: 1 },
  { id: 'ord-4', orderNumber: 'CO-2026-0137', buyerName: 'Grand Hotel Ankara', sellerName: 'Denizli Textile Works', status: 'CONFIRMED', total: 386000, currency: 'TRY', placedAt: '2026-06-28', dueDate: '2026-07-20', itemCount: 120 },
  { id: 'ord-5', orderNumber: 'CO-2026-0135', buyerName: 'HomeStyle Interiors', sellerName: 'Kumaşçı Fabric House', status: 'DELIVERED', total: 85000, currency: 'TRY', placedAt: '2026-06-10', itemCount: 6 },
  { id: 'ord-7', orderNumber: 'CO-2026-0128', buyerName: 'Grand Hotel Ankara', sellerName: 'Carra Woods', status: 'COMPLETED', total: 124000, currency: 'TRY', placedAt: '2026-05-28', itemCount: 40 },
]

/** Well-known city coordinates for demo-mode logistics scoring. */
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  istanbul: { lat: 41.0082, lng: 28.9784 },
  ankara: { lat: 39.9334, lng: 32.8597 },
  izmir: { lat: 38.4237, lng: 27.1428 },
  bursa: { lat: 40.1885, lng: 29.061 },
  denizli: { lat: 37.7765, lng: 29.0864 },
  gaziantep: { lat: 37.0662, lng: 37.3833 },
  antalya: { lat: 36.8969, lng: 30.7133 },
  adana: { lat: 37.0, lng: 35.3213 },
}
