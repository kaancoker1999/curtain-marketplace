// Alan (domain) enum değerlerinin Türkçe karşılıkları — tüm arayüzde tek kaynak.

import type { OrderStatus, OrgRole, PricingModel, ProductCategory, ServiceType } from './types'

export const ROLE_LABELS: Record<OrgRole, string> = {
  RETAILER: 'Perakendeci',
  MANUFACTURER: 'Üretici',
  SEWING_WORKSHOP: 'Dikim Atölyesi',
  FABRIC_SUPPLIER: 'Kumaş Tedarikçisi',
  INSTALLER: 'Montaj Ekibi',
  LOGISTICS_PROVIDER: 'Lojistik',
  CREATIVE_STUDIO: 'Tasarım Stüdyosu',
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  SEWING: 'Dikim',
  INSTALLATION: 'Montaj',
  MEASUREMENT: 'Ölçüm',
  DESIGN: 'Tasarım',
  PLEATING: 'Pile',
  EMBROIDERY: 'Nakış',
  MOTORIZATION: 'Motorlu Sistem',
  LOGISTICS: 'Lojistik',
}

export const PRICING_MODEL_LABELS: Record<PricingModel, string> = {
  FIXED: 'sabit',
  PER_METER: '/ metre',
  PER_SQM: '/ m²',
  PER_PANEL: '/ panel',
  PER_HOUR: '/ saat',
  PER_KM: '/ km',
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  CURTAIN: 'Perde',
  SHEER: 'Tül',
  BLACKOUT: 'Karartma',
  ROLLER_BLIND: 'Stor',
  ZEBRA_BLIND: 'Zebra',
  VENETIAN_BLIND: 'Jaluzi',
  ROMAN_SHADE: 'Roman Perde',
  CELLULAR_SHADE: 'Hücreli Perde',
  TULLE: 'Tül Perde',
  ACCESSORY: 'Aksesuar',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: 'Taslak',
  CONFIRMED: 'Onaylandı',
  IN_PRODUCTION: 'Üretimde',
  QUALITY_CHECK: 'Kalite Kontrol',
  READY_FOR_SHIPMENT: 'Sevkiyata Hazır',
  SHIPPED: 'Kargoda',
  DELIVERED: 'Teslim Edildi',
  INSTALLED: 'Monte Edildi',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
  DISPUTED: 'İtilaflı',
}
