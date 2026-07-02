'use client'

// Ölçüye özel Roman perde konfigüratörü (Carra Woods ürünü).
// Kural motoru: kumaş koleksiyonları ve fiyat tablosu (taban + m² oranı)
// seçilen ışık kontrolüne bağlıdır — her geçirgenlik seviyesinin kendi
// koleksiyonları vardır (örn. Işık Süzen → Outlander & Nomad,
// Karartma → Hesperia). Işık kontrolü değişince kumaş seçimi sıfırlanır.

import { useMemo, useState } from 'react'
import { BadgeCheck, Check, Info, ShieldCheck, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatTRY } from '@/lib/format'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Seçenekler
// ---------------------------------------------------------------------------

const MOUNTS = [
  {
    id: 'inside',
    label: 'İçe Montaj',
    desc: 'Perde pencere kasasının içine monte edilir; gömme, temiz bir görünüm verir.',
    note: 'Min. kasa derinliği: 4 cm',
  },
  {
    id: 'outside',
    label: 'Dışa Montaj',
    desc: 'Perde duvara veya pencere üstüne monte edilir; camı tam kapatır.',
    note: 'Min. düz yüzey: 6 cm',
  },
] as const

const FOLD_STYLES = [
  { id: 'back-batten', label: 'Arkadan Çubuklu', desc: 'Çubuklar arkada gizlidir; önden dümdüz, kesintisiz bir yüz.', price: 0 },
  { id: 'front-stitched', label: 'Önden Dikişli', desc: 'Kat hatları önden ince dikişlerle belirginleştirilir.', price: 0 },
  { id: 'relaxed', label: 'Gevşek Etek', desc: 'Alt kenarda yumuşak bir kavis.', price: 0 },
  { id: 'hobbled', label: 'Kademeli (Hobbled)', desc: 'Üst üste binen dolgun kat görünümü.', price: 1800 },
] as const

type LightControlId = 'sheer' | 'semi-sheer' | 'light-filtering' | 'room-darkening' | 'blackout'

const LIGHT_CONTROLS: { id: LightControlId; label: string; desc: string }[] = [
  { id: 'sheer', label: 'Tül Geçirgen', desc: 'Maksimum ışık, zarif dokuma.' },
  { id: 'semi-sheer', label: 'Yarı Geçirgen', desc: 'Yumuşak ışık, hafif doku.' },
  { id: 'light-filtering', label: 'Işık Süzen', desc: 'Gündüz mahremiyeti, sıcak aydınlık.' },
  { id: 'room-darkening', label: 'Loşlaştıran', desc: 'Işığın büyük bölümünü keser.' },
  { id: 'blackout', label: 'Karartma', desc: 'Astarla birlikte tam karanlık sağlar.' },
]

// ---------------------------------------------------------------------------
// Kumaş koleksiyonları — ışık kontrolüne göre
// ---------------------------------------------------------------------------

interface FabricOption {
  id: string
  label: string
  hex: string
}

interface FabricCollection {
  id: string
  label: string
  desc: string
  fabrics: FabricOption[]
}

const SHEER_COLLECTIONS: FabricCollection[] = [
  {
    id: 'soho',
    label: 'Koleksiyon · Soho',
    desc: 'Dokulu ve çizgili tül dokumalar',
    fabrics: [
      { id: 'buzul-tulu', label: 'Buzul Tülü', hex: '#DCE1E4' },
      { id: 'dere-tasi', label: 'Dere Taşı', hex: '#C7C3BB' },
      { id: 'sis-alasimi', label: 'Sis Alaşımı', hex: '#C2C6C9' },
      { id: 'adacayi-cizgi', label: 'Adaçayı Çizgi', hex: '#CBD1C4' },
      { id: 'kamis-dokusu', label: 'Kamış Dokusu', hex: '#D6CFBF' },
      { id: 'grafit-akisi', label: 'Grafit Akışı', hex: '#9B9EA3' },
      { id: 'kum-cizgisi', label: 'Kum Çizgisi', hex: '#D9CBB0' },
      { id: 'kul-cizgisi', label: 'Kül Çizgisi', hex: '#B5B0A8' },
      { id: 'grafit-kenar', label: 'Grafit Kenar', hex: '#7E8287' },
      { id: 'beyaz-iz', label: 'Beyaz İz', hex: '#EDEDE9' },
      { id: 'kizil-igne', label: 'Kızıl İğne', hex: '#B0656B' },
      { id: 'zeytin-kabugu', label: 'Zeytin Kabuğu', hex: '#8B8465' },
    ],
  },
  {
    id: 'lucetta',
    label: 'Koleksiyon · Lucetta',
    desc: 'İnce, ışıltılı tüller',
    fabrics: [
      { id: 'inci-isigi', label: 'İnci Işığı', hex: '#F2F0EA' },
      { id: 'sut-beyazi', label: 'Süt Beyazı', hex: '#EFEBE2' },
      { id: 'safak-pembesi', label: 'Şafak Pembesi', hex: '#E8D8D4' },
      { id: 'gumus-tel', label: 'Gümüş Tel', hex: '#D4D6D9' },
      { id: 'duman-halkasi', label: 'Duman Halkası', hex: '#BEC1C4' },
      { id: 'bal-kopugu', label: 'Bal Köpüğü', hex: '#E6DCC0' },
      { id: 'ekru', label: 'Ekru', hex: '#E2DAC8' },
      { id: 'golge-beyazi', label: 'Gölge Beyazı', hex: '#D9DAD4' },
    ],
  },
  {
    id: 'piero',
    label: 'Koleksiyon · Piero',
    desc: 'Gri ve mineral tonlar',
    fabrics: [
      { id: 'kayrak', label: 'Kayrak', hex: '#6E7379' },
      { id: 'demir-golge', label: 'Demir Gölge', hex: '#5B5F66' },
      { id: 'grafit-golge', label: 'Grafit Gölge', hex: '#6E7076' },
      { id: 'kul-sisi', label: 'Kül Sisi', hex: '#B9BBBD' },
      { id: 'tas-dumani', label: 'Taş Dumanı', hex: '#8D8579' },
      { id: 'toz-vizon', label: 'Toz Vizon', hex: '#B3A99C' },
      { id: 'bulut-cinko', label: 'Bulut Çinko', hex: '#C9CDD1' },
      { id: 'mermer-grisi', label: 'Mermer Grisi', hex: '#D8DADC' },
      { id: 'gumus-sis', label: 'Gümüş Sis', hex: '#C3C7CC' },
      { id: 'celik-tul', label: 'Çelik Tül', hex: '#7C8794' },
    ],
  },
  {
    id: 'umberto',
    label: 'Koleksiyon · Umberto',
    desc: 'Düz, doğal dokular',
    fabrics: [
      { id: 'tebesir', label: 'Tebeşir', hex: '#E9E7E1' },
      { id: 'kemik', label: 'Kemik', hex: '#DDD6C8' },
      { id: 'zeytin', label: 'Zeytin', hex: '#A8A188' },
      { id: 'sis', label: 'Sis', hex: '#CFD2D4' },
      { id: 'grafit', label: 'Grafit', hex: '#8A8B8D' },
      { id: 'kil', label: 'Kil', hex: '#C0A88E' },
      { id: 'toz', label: 'Toz', hex: '#A99F92' },
      { id: 'kul', label: 'Kül', hex: '#75706B' },
      { id: 'cakmaktasi', label: 'Çakmaktaşı', hex: '#8F8C6F' },
      { id: 'ayaz', label: 'Ayaz', hex: '#7D93A8' },
      { id: 'komur', label: 'Kömür', hex: '#5A5D64' },
      { id: 'obsidyen', label: 'Obsidyen', hex: '#66707E' },
    ],
  },
]

const SEMI_SHEER_COLLECTIONS: FabricCollection[] = [
  {
    id: 'marlow',
    label: 'Koleksiyon · Marlow',
    desc: 'Yumuşak, geniş renk gamı',
    fabrics: [
      { id: 'soluk-akinti', label: 'Soluk Akıntı', hex: '#DCE3E8' },
      { id: 'pamuk-tozu', label: 'Pamuk Tozu', hex: '#E7E2D6' },
      { id: 'keten-sisi-m', label: 'Keten Sisi', hex: '#DED7C4' },
      { id: 'kil-fisiltisi', label: 'Kil Fısıltısı', hex: '#D9D2C6' },
      { id: 'dogal-kabuk', label: 'Doğal Kabuk', hex: '#CFC5B0' },
      { id: 'cakil-tonu', label: 'Çakıl Tonu', hex: '#C9C2B4' },
      { id: 'kumtasi-tulu', label: 'Kumtaşı Tülü', hex: '#C2B49C' },
      { id: 'alacakaranlik-yosunu', label: 'Alacakaranlık Yosunu', hex: '#A99F8C' },
      { id: 'adacayi-bulutu', label: 'Adaçayı Bulutu', hex: '#B7C0B4' },
      { id: 'kayrak-kumulu', label: 'Kayrak Kumulu', hex: '#9AA0A4' },
      { id: 'gri-agac', label: 'Gri Ağaç', hex: '#8E9AAC' },
      { id: 'sicak-cakmaktasi', label: 'Sıcak Çakmaktaşı', hex: '#97A08B' },
      { id: 'kumul-dumani', label: 'Kumul Dumanı', hex: '#8F8C81' },
      { id: 'zeytin-sisi-m', label: 'Zeytin Sisi', hex: '#6E7370' },
      { id: 'arnavut-kaldirimi', label: 'Arnavut Kaldırımı', hex: '#7A6A66' },
      { id: 'kutup-pusu', label: 'Kutup Pusu', hex: '#4A5F8A' },
      { id: 'lavanta-kulu', label: 'Lavanta Külü', hex: '#8B7FA6' },
      { id: 'gul-tozu', label: 'Gül Tozu', hex: '#D8A9B4' },
    ],
  },
  {
    id: 'lazuli',
    label: 'Koleksiyon · Lazuli',
    desc: 'İnce dokuma, sakin tonlar',
    fabrics: [
      { id: 'dokuma', label: 'Dokuma', hex: '#C5CDD4' },
      { id: 'tutam', label: 'Tutam', hex: '#D6D3C4' },
      { id: 'akinti', label: 'Akıntı', hex: '#C9C9BE' },
      { id: 'tahil', label: 'Tahıl', hex: '#B4AF97' },
      { id: 'golge', label: 'Gölge', hex: '#8E9BA6' },
      { id: 'iplik', label: 'İplik', hex: '#9A9C9E' },
      { id: 'parilti', label: 'Parıltı', hex: '#7C7E72' },
      { id: 'vizon', label: 'Vizon', hex: '#A9A093' },
    ],
  },
  {
    id: 'carillo',
    label: 'Koleksiyon · Carillo',
    desc: 'Doğal keten görünümü',
    fabrics: [
      { id: 'kul-kumulu', label: 'Kül Kumulu', hex: '#6B6862' },
      { id: 'tas-tulu', label: 'Taş Tülü', hex: '#9C9488' },
      { id: 'dokuma-vizon', label: 'Dokuma Vizon', hex: '#ABA091' },
      { id: 'fisilti-bej', label: 'Fısıltı Bej', hex: '#C4BBA9' },
      { id: 'hus-keteni', label: 'Huş Keteni', hex: '#D3CDBD' },
      { id: 'kirectasi-sisi', label: 'Kireçtaşı Sisi', hex: '#B9BCBB' },
      { id: 'soluk-kamis', label: 'Soluk Kamış', hex: '#4E4C46' },
      { id: 'grafit-kor', label: 'Grafit Kor', hex: '#6E6A66' },
      { id: 'golge-fildisi', label: 'Gölge Fildişi', hex: '#46586E' },
    ],
  },
  {
    id: 'arrow',
    label: 'Koleksiyon · Arrow',
    desc: 'Grafik dokular',
    fabrics: [
      { id: 'sis-a', label: 'Sis', hex: '#B9BEC2' },
      { id: 'kil-a', label: 'Kil', hex: '#ADA396' },
      { id: 'grafit-a', label: 'Grafit', hex: '#9B9C9E' },
      { id: 'sirt', label: 'Sırt', hex: '#C3C6C9' },
    ],
  },
  {
    id: 'periscope',
    label: 'Koleksiyon · Periscope',
    desc: 'Modern nötrler ve toprak tonları',
    fabrics: [
      { id: 'ayaz-keteni', label: 'Ayaz Keteni', hex: '#E3E3DE' },
      { id: 'sabah-kulu', label: 'Sabah Külü', hex: '#D6D6D0' },
      { id: 'safak-sisi', label: 'Şafak Sisi', hex: '#CDD1D2' },
      { id: 'bulut-tulu', label: 'Bulut Tülü', hex: '#C4C8CB' },
      { id: 'sessiz-kalay', label: 'Sessiz Kalay', hex: '#B8BCBE' },
      { id: 'cakil-tozu-p', label: 'Çakıl Tozu', hex: '#A9ADB0' },
      { id: 'kul-limani', label: 'Kül Limanı', hex: '#9A968C' },
      { id: 'toz-vizon-p', label: 'Toz Vizon', hex: '#6F6C64' },
      { id: 'bej-dinginlik', label: 'Bej Dinginlik', hex: '#8A8578' },
      { id: 'gunbatimi-topragi', label: 'Günbatımı Toprağı', hex: '#C4674B' },
      { id: 'bronz-pus', label: 'Bronz Pus', hex: '#7D7A72' },
      { id: 'altin-toprak', label: 'Altın Toprak', hex: '#B9A468' },
    ],
  },
  {
    id: 'atmosphere',
    label: 'Koleksiyon · Atmosphere',
    desc: 'Bulutsu, atmosferik tonlar',
    fabrics: [
      { id: 'bulut-katmani', label: 'Bulut Katmanı', hex: '#DDE1E4' },
      { id: 'gokyuzu-grisi', label: 'Gökyüzü Grisi', hex: '#C2CAD2' },
      { id: 'yagmur-pusu', label: 'Yağmur Pusu', hex: '#A9B4BC' },
      { id: 'ozon', label: 'Ozon', hex: '#93A4B4' },
      { id: 'alacakaranlik', label: 'Alacakaranlık', hex: '#7B8494' },
      { id: 'kuzey-ruzgari', label: 'Kuzey Rüzgârı', hex: '#B7C4C6' },
      { id: 'sabah-bugusu', label: 'Sabah Buğusu', hex: '#D2D8D2' },
      { id: 'ay-halesi', label: 'Ay Halesi', hex: '#E4E4DC' },
    ],
  },
]

const LIGHT_FILTERING_COLLECTIONS: FabricCollection[] = [
  {
    id: 'outlander',
    label: 'Koleksiyon · Outlander',
    desc: 'Nötrlerden canlı tonlara geniş yelpaze',
    fabrics: [
      { id: 'fildisi-bulut', label: 'Fildişi Bulut', hex: '#EDEBE4' },
      { id: 'yumusak-kum', label: 'Yumuşak Kum', hex: '#E3DCC9' },
      { id: 'keten-sisi-o', label: 'Keten Sisi', hex: '#D3CDBB' },
      { id: 'badem-kabugu', label: 'Badem Kabuğu', hex: '#CBD0C8' },
      { id: 'istiridye-beyazi', label: 'İstiridye Beyazı', hex: '#B9C0AE' },
      { id: 'aytasi', label: 'Aytaşı', hex: '#A9A5A9' },
      { id: 'kul-erigi', label: 'Kül Eriği', hex: '#8D8880' },
      { id: 'cakil-beji', label: 'Çakıl Beji', hex: '#B3A489' },
      { id: 'gunesli-kum', label: 'Güneşli Kum', hex: '#CDB863' },
      { id: 'kavrulmus-bal', label: 'Kavrulmuş Bal', hex: '#D3A954' },
      { id: 'yanik-toprak', label: 'Yanık Toprak', hex: '#C07A3E' },
      { id: 'tarcin-kili', label: 'Tarçın Kili', hex: '#C0592F' },
      { id: 'terrakota-alevi', label: 'Terrakota Alevi', hex: '#C34E33' },
      { id: 'kizil-cicek', label: 'Kızıl Çiçek', hex: '#C13438' },
      { id: 'yakut-kirmizisi', label: 'Yakut Kırmızısı', hex: '#A81F2E' },
      { id: 'bogurtlen-pembesi', label: 'Böğürtlen Pembesi', hex: '#D6AEC4' },
      { id: 'leylak-sisi', label: 'Leylak Sisi', hex: '#B79BC0' },
      { id: 'lavanta-tozu', label: 'Lavanta Tozu', hex: '#9C90C4' },
    ],
  },
  {
    id: 'nomad',
    label: 'Koleksiyon · Nomad',
    desc: 'Etnik desenli dokumalar',
    fabrics: [
      { id: 'asi-boyasi', label: 'Aşı Boyası', hex: '#C8A96A' },
      { id: 'kehribar-ayazi', label: 'Kehribar Ayazı', hex: '#C6B490' },
      { id: 'savan-altini', label: 'Savan Altını', hex: '#F2EFE6' },
      { id: 'kanvas-kemik', label: 'Kanvas Kemik', hex: '#DFD9C6' },
      { id: 'tas-n', label: 'Taş', hex: '#7A8894' },
      { id: 'kumtasi-akintisi', label: 'Kumtaşı Akıntısı', hex: '#B39B7A' },
    ],
  },
]

const ROOM_DARKENING_COLLECTIONS: FabricCollection[] = [
  {
    id: 'hesperia',
    label: 'Koleksiyon · Hesperia',
    desc: 'Loşlaştıran dokumalar',
    fabrics: [
      { id: 'bulut-hatti', label: 'Bulut Hattı', hex: '#6E7379' },
      { id: 'kayrak-ocagi', label: 'Kayrak Ocağı', hex: '#565B61' },
      { id: 'grafit-tulu-b', label: 'Grafit Tülü', hex: '#83878C' },
      { id: 'demir-sisi', label: 'Demir Sisi', hex: '#9DA0A3' },
      { id: 'gumus-saz', label: 'Gümüş Saz', hex: '#BFBFBA' },
      { id: 'kul-akintisi', label: 'Kül Akıntısı', hex: '#C9C7C2' },
      { id: 'kumul-sisi', label: 'Kumul Sisi', hex: '#D5D1C7' },
      { id: 'zeytin-tahili', label: 'Zeytin Tahılı', hex: '#B0B29E' },
      { id: 'yulaf-tonu', label: 'Yulaf Tonu', hex: '#E3E1DA' },
      { id: 'karbon-dokuma', label: 'Karbon Dokuma', hex: '#4A4C50' },
      { id: 'mavi-alacakaranlik', label: 'Mavi Alacakaranlık', hex: '#5C6B84' },
    ],
  },
]

const BLACKOUT_COLLECTIONS: FabricCollection[] = [
  {
    id: 'obscura',
    label: 'Koleksiyon · Obscura',
    desc: 'Tam karartma dokumalar',
    fabrics: [
      { id: 'gece-murekkebi', label: 'Gece Mürekkebi', hex: '#2E3138' },
      { id: 'kuzgun', label: 'Kuzgun', hex: '#3A3A3C' },
      { id: 'antrasit', label: 'Antrasit', hex: '#4A4D52' },
      { id: 'derin-deniz', label: 'Derin Deniz', hex: '#39485C' },
      { id: 'kestane-karasi', label: 'Kestane Karası', hex: '#463832' },
      { id: 'bazalt', label: 'Bazalt', hex: '#5B5E63' },
      { id: 'kursun', label: 'Kurşun', hex: '#6D7178' },
      { id: 'zift', label: 'Zift', hex: '#26262A' },
      { id: 'gece-mavisi', label: 'Gece Mavisi', hex: '#2F3A52' },
      { id: 'koyu-mese', label: 'Koyu Meşe', hex: '#54443A' },
      { id: 'volkanik-kul', label: 'Volkanik Kül', hex: '#7C7E82' },
    ],
  },
]

/** Işık kontrolüne göre kumaş koleksiyonları. */
const COLLECTIONS_BY_LIGHT: Record<LightControlId, FabricCollection[]> = {
  sheer: SHEER_COLLECTIONS,
  'semi-sheer': SEMI_SHEER_COLLECTIONS,
  'light-filtering': LIGHT_FILTERING_COLLECTIONS,
  'room-darkening': ROOM_DARKENING_COLLECTIONS,
  blackout: BLACKOUT_COLLECTIONS,
}

// ---------------------------------------------------------------------------
// Fiyatlandırma — her ışık kontrolünün kendi fiyat tablosu var
// ---------------------------------------------------------------------------

interface PriceTable {
  base: number
  areaRatePerM2: number
}

const BASE_AREA_M2 = 0.56 // taban fiyat ~60×93 cm'e kadar olan ölçüyü kapsar

const PRICE_TABLES: Record<LightControlId, PriceTable> = {
  sheer: { base: 5550, areaRatePerM2: 3100 },
  'semi-sheer': { base: 6100, areaRatePerM2: 3400 },
  'light-filtering': { base: 6100, areaRatePerM2: 3400 },
  'room-darkening': { base: 9450, areaRatePerM2: 5300 },
  blackout: { base: 7350, areaRatePerM2: 4100 },
}

const LIFT_SYSTEMS = [
  { id: 'cordless', label: 'İpsiz (Cordless)', desc: 'Elle itip çekerek kullanılır; çocuk güvenliği için en iyi seçenek.', price: 0 },
  { id: 'cord-loop', label: 'Sonsuz Zincir', desc: 'Zincirle kontrol; büyük ve yüksek pencereler için pratik.', price: 900 },
  { id: 'motorized', label: 'Motorlu', desc: 'Uzaktan kumanda ve akıllı ev entegrasyonu.', price: 7500 },
] as const

const TDBU_OPTIONS = [
  { id: 'none', label: 'Standart', desc: 'Perde yalnızca alttan yukarı toplanır.', price: 0 },
  { id: 'tdbu', label: 'Üstten Aç / Alttan Kapa (TDBU)', desc: 'Üstten de açılır; mahremiyeti korurken tepeden ışık alırsınız.', price: 2100 },
] as const

const LINERS = [
  { id: 'none', label: 'Astarsız', desc: 'Kumaş kendi geçirgenliğiyle kullanılır.', price: 0 },
  { id: 'light-filtering', label: 'Işık Süzen Astar', desc: 'Işığı yumuşakça süzer, kumaşı korur.', price: 720 },
  { id: 'blackout', label: 'Karartma Astar', desc: 'Işığın %99+ engellenir; yatak odası için ideal.', price: 1450 },
] as const

interface ConfigState {
  room: string
  mount: (typeof MOUNTS)[number]['id']
  widthCm: number
  heightCm: number
  fold: (typeof FOLD_STYLES)[number]['id']
  lightControl: LightControlId
  fabric: FabricOption | null
  lift: (typeof LIFT_SYSTEMS)[number]['id']
  tdbu: (typeof TDBU_OPTIONS)[number]['id']
  liner: (typeof LINERS)[number]['id']
}

function computePrice(state: ConfigState) {
  const table = PRICE_TABLES[state.lightControl]
  const areaM2 = (state.widthCm / 100) * (state.heightCm / 100)
  const sizeAdj = Math.max(0, (areaM2 - BASE_AREA_M2) * table.areaRatePerM2)
  const fold = FOLD_STYLES.find((f) => f.id === state.fold)?.price ?? 0
  const lift = LIFT_SYSTEMS.find((l) => l.id === state.lift)?.price ?? 0
  const tdbu = TDBU_OPTIONS.find((t) => t.id === state.tdbu)?.price ?? 0
  const liner = LINERS.find((l) => l.id === state.liner)?.price ?? 0
  return {
    base: table.base,
    sizeAdj: Math.round(sizeAdj),
    fold,
    lift,
    tdbu,
    liner,
    total: Math.round(table.base + sizeAdj + fold + lift + tdbu + liner),
  }
}

// ---------------------------------------------------------------------------
// Canlı önizleme — pile stiline göre değişen Roman perde çizimi
// ---------------------------------------------------------------------------

function RomanPreview({ fabric, fold, drop }: { fabric: FabricOption | null; fold: string; drop: number }) {
  const fill = fabric?.hex ?? '#C7C3BB'
  const shadeHeight = 60 + drop * 170
  const folds = 5
  const segH = shadeHeight / folds
  const segments = Array.from({ length: folds }, (_, i) => 56 + i * segH)
  return (
    <svg viewBox="0 0 320 340" className="w-full max-w-sm" role="img" aria-label="Perde önizleme">
      <rect x="20" y="20" width="280" height="300" rx="4" fill="#FFFFFF" stroke="#D8D2C6" strokeWidth="6" />
      <rect x="40" y="40" width="240" height="260" fill="#EAF2F7" />
      <circle cx="90" cy="270" r="34" fill="#B9CDA4" opacity="0.8" />
      <circle cx="230" cy="280" r="44" fill="#A5BE8F" opacity="0.8" />
      <rect x="36" y="44" width="248" height="12" rx="3" fill="#C9BFAD" />
      <rect x="38" y="56" width="244" height={shadeHeight} fill={fill} />
      {fold === 'front-stitched' &&
        segments.slice(1).map((y) => (
          <line key={y} x1="38" x2="282" y1={y} y2={y} stroke="#000" strokeOpacity="0.14" strokeWidth="1.5" strokeDasharray="5 3" />
        ))}
      {fold === 'hobbled' &&
        segments.map((y) => (
          <path
            key={y}
            d={`M 38 ${y + segH} Q 160 ${y + segH + 14} 282 ${y + segH}`}
            fill="none"
            stroke="#000"
            strokeOpacity="0.18"
            strokeWidth="3"
          />
        ))}
      {fold === 'relaxed' && (
        <path
          d={`M 38 ${52 + shadeHeight} Q 160 ${76 + shadeHeight} 282 ${52 + shadeHeight}`}
          fill={fill}
          stroke="#000"
          strokeOpacity="0.12"
        />
      )}
      {fold !== 'relaxed' && (
        <rect x="36" y={52 + shadeHeight} width="248" height="7" rx="3" fill={fill} stroke="#000" strokeOpacity="0.15" />
      )}
    </svg>
  )
}

function Step({ no, title, children }: { no: string; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-3 text-sm font-semibold tracking-wide text-muted-foreground">
        <span className="text-primary">{no}</span>
        <span className="h-px w-8 bg-border" />
        <span className="uppercase">{title}</span>
      </h2>
      {children}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Ana konfigüratör
// ---------------------------------------------------------------------------

export function RomanShadeConfigurator() {
  const [state, setState] = useState<ConfigState>({
    room: '',
    mount: 'inside',
    widthCm: 90,
    heightCm: 120,
    fold: 'back-batten',
    lightControl: 'light-filtering',
    fabric: null,
    lift: 'cordless',
    tdbu: 'none',
    liner: 'none',
  })
  const [submitted, setSubmitted] = useState(false)

  const price = useMemo(() => computePrice(state), [state])
  const fabricCollections = COLLECTIONS_BY_LIGHT[state.lightControl]
  const drop = Math.min(1, Math.max(0.35, state.heightCm / 300))
  const dimsValid =
    state.widthCm >= 30 && state.widthCm <= 300 && state.heightCm >= 30 && state.heightCm <= 300
  const complete = state.fabric !== null && dimsValid

  function patch(p: Partial<ConfigState>) {
    setState((s) => {
      const next = { ...s, ...p }
      // Işık kontrolü değişince kumaş koleksiyonları da değişir → seçimi sıfırla.
      if (p.lightControl && p.lightControl !== s.lightControl) {
        next.fabric = null
      }
      return next
    })
    setSubmitted(false)
  }

  const foldLabel = FOLD_STYLES.find((f) => f.id === state.fold)!.label
  const lightLabel = LIGHT_CONTROLS.find((l) => l.id === state.lightControl)!.label
  const linerLabel = LINERS.find((l) => l.id === state.liner)!.label

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
      {/* Sol: yapışkan önizleme + fiyat */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="flex flex-col items-center gap-4 rounded-xl border bg-muted/20 p-6">
          <RomanPreview fabric={state.fabric} fold={state.fold} drop={drop} />
          <div className="flex w-full items-center justify-between border-t pt-4">
            <div>
              <div className="text-sm text-muted-foreground">Roman Perde</div>
              <div className="text-2xl font-semibold">{formatTRY(price.total)}</div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <div>{state.widthCm} × {state.heightCm} cm · {foldLabel}</div>
              <div>{lightLabel} · {state.fabric ? state.fabric.label : 'Kumaş seçilmedi'}</div>
            </div>
          </div>
          <div className="flex w-full flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Truck className="size-3.5" /> ~7-14 iş gününde sevkiyat</span>
            <span className="flex items-center gap-1"><ShieldCheck className="size-3.5" /> Tam uyum garantisi</span>
            <span className="flex items-center gap-1"><BadgeCheck className="size-3.5 text-primary" /> Üretici: Carra Woods</span>
          </div>
        </div>
      </div>

      {/* Sağ: sihirbaz */}
      <div className="space-y-10">
        <Step no="01" title="Oda">
          <div className="space-y-2">
            <Label htmlFor="rs-room">Oda / pencere adı</Label>
            <Input
              id="rs-room"
              value={state.room}
              placeholder="örn. Yatak Odası, Salon Sol Pencere…"
              onChange={(e) => patch({ room: e.target.value })}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Sepette pencereleri ayırt edebilmeniz için bu pencereye ad verir.
          </p>
        </Step>

        <Step no="02" title="Montaj Tipi">
          <div className="grid grid-cols-2 gap-3">
            {MOUNTS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => patch({ mount: m.id })}
                className={cn(
                  'rounded-lg border p-4 text-left transition-colors',
                  state.mount === m.id ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                )}
              >
                <div className="font-medium">{m.label}</div>
                <p className="mt-1 text-xs text-muted-foreground">{m.desc}</p>
                <p className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
                  <Info className="size-3" /> {m.note}
                </p>
              </button>
            ))}
          </div>
        </Step>

        <Step no="03" title="En & Boy">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rs-width">Genişlik (cm)</Label>
              <Input
                id="rs-width"
                type="number"
                min={30}
                max={300}
                value={state.widthCm}
                onChange={(e) => patch({ widthCm: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rs-height">Yükseklik (cm)</Label>
              <Input
                id="rs-height"
                type="number"
                min={30}
                max={300}
                value={state.heightCm}
                onChange={(e) => patch({ heightCm: Number(e.target.value) })}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Açıklığı kenardan kenara ölçün. 30–300 cm arası, milimetre hassasiyetinde üretilir.
            {!dimsValid && (
              <span className="ml-1 font-medium text-destructive">Ölçüler 30–300 cm aralığında olmalı.</span>
            )}
          </p>
        </Step>

        <Step no="04" title="Pile Stili">
          <div className="grid grid-cols-2 gap-3">
            {FOLD_STYLES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => patch({ fold: f.id })}
                className={cn(
                  'rounded-lg border p-4 text-left transition-colors',
                  state.fold === f.id ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                )}
              >
                <div className="text-sm font-medium">{f.label}</div>
                <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
                <p className="mt-2 text-xs font-medium">{f.price ? `+${formatTRY(f.price)}` : 'Ücretsiz'}</p>
              </button>
            ))}
          </div>
        </Step>

        <Step no="05" title="Işık Kontrolü">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {LIGHT_CONTROLS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => patch({ lightControl: l.id })}
                className={cn(
                  'rounded-lg border p-4 text-left transition-colors',
                  state.lightControl === l.id ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                )}
              >
                <div className="text-sm font-medium">{l.label}</div>
                <p className="mt-1 text-xs text-muted-foreground">{l.desc}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Her geçirgenlik seviyesinin kendi kumaş koleksiyonları ve fiyat tablosu vardır; seçiminiz
            bir sonraki adımdaki kumaşları belirler.
          </p>
        </Step>

        <Step no="06" title="Kumaş & Renk">
          <div className="space-y-5">
            {fabricCollections.map((collection) => (
              <div key={collection.id}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {collection.label} <span className="font-normal normal-case">— {collection.desc}</span>
                </h3>
                <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
                  {collection.fabrics.map((fabric) => (
                    <button
                      key={fabric.id}
                      type="button"
                      title={fabric.label}
                      onClick={() => patch({ fabric })}
                      className={cn(
                        'group flex flex-col items-center gap-1 rounded-md p-1 transition-colors hover:bg-accent',
                        state.fabric?.id === fabric.id && 'bg-accent',
                      )}
                    >
                      <span
                        className={cn(
                          'relative block h-9 w-full rounded border',
                          state.fabric?.id === fabric.id && 'ring-2 ring-primary ring-offset-1',
                        )}
                        style={{ backgroundColor: fabric.hex }}
                      >
                        {state.fabric?.id === fabric.id && (
                          <Check className="absolute inset-0 m-auto size-4 text-white mix-blend-difference" />
                        )}
                      </span>
                      <span className="w-full truncate text-center text-[10px] leading-tight text-muted-foreground">
                        {fabric.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Koleksiyonlar seçtiğiniz ışık kontrolüne göre değişir. Ekran renkleri ışığa göre
              farklılık gösterebilir — emin olmak için ücretsiz kumaş örneği isteyin.
            </p>
          </div>
        </Step>

        <Step no="07" title="Mekanizma Sistemi">
          <div className="grid grid-cols-3 gap-3">
            {LIFT_SYSTEMS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => patch({ lift: l.id })}
                className={cn(
                  'rounded-lg border p-4 text-left transition-colors',
                  state.lift === l.id ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                )}
              >
                <div className="text-sm font-medium">{l.label}</div>
                <p className="mt-1 text-xs text-muted-foreground">{l.desc}</p>
                <p className="mt-2 text-xs font-medium">{l.price ? `+${formatTRY(l.price)}` : 'Ücretsiz'}</p>
              </button>
            ))}
          </div>
        </Step>

        <Step no="08" title="Açılım Tipi">
          <div className="grid grid-cols-2 gap-3">
            {TDBU_OPTIONS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => patch({ tdbu: t.id })}
                className={cn(
                  'rounded-lg border p-4 text-left transition-colors',
                  state.tdbu === t.id ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                )}
              >
                <div className="text-sm font-medium">{t.label}</div>
                <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
                <p className="mt-2 text-xs font-medium">{t.price ? `+${formatTRY(t.price)}` : 'Ücretsiz'}</p>
              </button>
            ))}
          </div>
        </Step>

        <Step no="09" title="Astar">
          <div className="grid grid-cols-3 gap-3">
            {LINERS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => patch({ liner: l.id })}
                className={cn(
                  'rounded-lg border p-4 text-left transition-colors',
                  state.liner === l.id ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                )}
              >
                <div className="text-sm font-medium">{l.label}</div>
                <p className="mt-1 text-xs text-muted-foreground">{l.desc}</p>
                <p className="mt-2 text-xs font-medium">{l.price ? `+${formatTRY(l.price)}` : 'Ücretsiz'}</p>
              </button>
            ))}
          </div>
        </Step>

        <Step no="10" title="Özet">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Teklifiniz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <QuoteRow
                label="Taban fiyat"
                sub={`${lightLabel} — ışık kontrolüne özel fiyat tablosu`}
                value={formatTRY(price.base)}
              />
              <QuoteRow
                label="Ölçü farkı"
                sub={`${state.widthCm} × ${state.heightCm} cm`}
                value={price.sizeAdj ? `+${formatTRY(price.sizeAdj)}` : 'Dahil'}
              />
              <QuoteRow label="Kumaş" sub={state.fabric?.label ?? 'Seçilmedi'} value="Dahil" />
              <QuoteRow label="Pile stili" sub={foldLabel} value={price.fold ? `+${formatTRY(price.fold)}` : 'Dahil'} />
              <QuoteRow
                label="Mekanizma"
                sub={LIFT_SYSTEMS.find((l) => l.id === state.lift)!.label}
                value={price.lift ? `+${formatTRY(price.lift)}` : 'Dahil'}
              />
              <QuoteRow
                label="Açılım"
                sub={TDBU_OPTIONS.find((t) => t.id === state.tdbu)!.label}
                value={price.tdbu ? `+${formatTRY(price.tdbu)}` : 'Dahil'}
              />
              <QuoteRow label="Astar" sub={linerLabel} value={price.liner ? `+${formatTRY(price.liner)}` : 'Dahil'} />
              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-medium">Tahmini Toplam</span>
                <span className="text-2xl font-semibold">{formatTRY(price.total)}</span>
              </div>

              {!complete && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  {!state.fabric && <div>Kumaş seçilmedi.</div>}
                  {!dimsValid && <div>Ölçüler 30–300 cm aralığında olmalı.</div>}
                </div>
              )}

              {submitted ? (
                <div className="rounded-md border border-primary/40 bg-primary/5 px-3 py-3 text-sm">
                  <span className="font-medium">Talebiniz alındı.</span> Carra Woods bu konfigürasyon
                  için siparişi onaylayacak; üretim ölçü teyidinin ardından başlar.
                </div>
              ) : (
                <Button className="w-full" size="lg" disabled={!complete} onClick={() => setSubmitted(true)}>
                  {complete ? 'Sipariş talebi oluştur' : 'Tüm seçenekleri tamamlayın'}
                </Button>
              )}
              <p className="text-center text-xs text-muted-foreground">
                Sipariş üzerine üretim · ~7-14 iş gününde kargoda · Üretim doğruluğu kesin ölçülere bağlıdır
              </p>
            </CardContent>
          </Card>
        </Step>
      </div>
    </div>
  )
}

function QuoteRow({ label, sub, value }: { label: string; sub: string; value: string }) {
  return (
    <div className="flex items-start justify-between border-b pb-2 last:border-0">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}
