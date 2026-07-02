'use client'

// Ölçüye özel hücreli perde konfigüratörü (Carra Woods ürünü).
// Kural motoru: hücre tipi seçenekleri ışık kontrolüne bağlıdır, renk paleti
// ve fiyat tablosu (taban + m² oranı) her ışık kontrolü × hücre tipi
// kombinasyonu için ayrı tanımlıdır.
//   - Tül Geçirgen  → yalnız Tek Hücre, 4 tül rengi
//   - Işık Süzen    → Tek / Çift / Üç Hücre, kombinasyona göre palet
//   - Karartma      → Tek / Çift Hücre, karartma paletleri

import { useMemo, useState } from 'react'
import { BadgeCheck, Check, Info, ShieldCheck, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatTRY } from '@/lib/format'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Seçenek verileri
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

type LightControlId = 'sheer' | 'light-filtering' | 'blackout'
type CellTypeId = 'single' | 'double' | 'triple'

const LIGHT_CONTROLS: { id: LightControlId; label: string; desc: string }[] = [
  { id: 'sheer', label: 'Tül Geçirgen', desc: 'Maksimum ışık, zarif dokuma; manzarayı korur.' },
  { id: 'light-filtering', label: 'Işık Süzen', desc: 'Güneşi süzer, gündüz mahremiyeti sağlar.' },
  { id: 'blackout', label: 'Karartma', desc: 'Işığın %99+ engellenir; yatak odası için ideal.' },
]

const CELL_TYPES: { id: CellTypeId; label: string; desc: string }[] = [
  { id: 'single', label: 'Tek Hücre', desc: 'İnce profil, standart yalıtım.' },
  { id: 'double', label: 'Çift Hücre', desc: 'Güçlü yalıtım, üstün ses sönümleme.' },
  { id: 'triple', label: 'Üç Hücre', desc: 'Sert iklimler için maksimum enerji verimliliği.' },
]

/** Işık kontrolüne göre seçilebilir hücre tipleri. */
const CELL_AVAILABILITY: Record<LightControlId, CellTypeId[]> = {
  sheer: ['single'],
  'light-filtering': ['single', 'double', 'triple'],
  blackout: ['single', 'double'],
}

const CELL_UNAVAILABLE_NOTE: Record<LightControlId, string> = {
  sheer: 'Tül geçirgen kumaş yalnızca tek hücre yapısında üretilir.',
  'light-filtering': '',
  blackout: 'Karartma kumaş tek veya çift hücre yapısında üretilir.',
}

// ---------------------------------------------------------------------------
// Renk paletleri (kombinasyona göre)
// ---------------------------------------------------------------------------

interface ColorOption {
  id: string
  label: string
  hex: string
  price?: number
}

interface ColorGroup {
  id: string
  label: string
  colors: ColorOption[]
}

const C = {
  cotton: { label: 'Pamuk', hex: '#F4F1E8' },
  whiteSand: { label: 'Beyaz Kum', hex: '#E8E1D0' },
  angora: { label: 'Angora', hex: '#D9CCB4' },
  khaki: { label: 'Haki', hex: '#C2B08D' },
  biscuit: { label: 'Bisküvi', hex: '#C9A470' },
  maize: { label: 'Mısır', hex: '#C68E4C' },
  tan: { label: 'Taba', hex: '#B57B3F' },
  spice: { label: 'Baharat', hex: '#A34B2B' },
  cocoa: { label: 'Kakao', hex: '#6C4B37' },
  willow: { label: 'Söğüt', hex: '#8A8C5B' },
  pomegranate: { label: 'Nar', hex: '#8E3A3C' },
  graySheen: { label: 'Gri Şimmer', hex: '#B9B8B3' },
  steel: { label: 'Çelik', hex: '#5A6470' },
  navy: { label: 'Lacivert', hex: '#3A4458' },
  black: { label: 'Siyah', hex: '#2B2B2B' },
  plum: { label: 'Erik', hex: '#4E3A4E' },
  softWhite: { label: 'Yumuşak Beyaz', hex: '#EFEDE4' },
  darkChocolate: { label: 'Bitter Çikolata', hex: '#3E2F28' },
  whisper: { label: 'Fısıltı', hex: '#D8D8D0' },
} as const

function colors(ids: (keyof typeof C)[], suffix: string): ColorOption[] {
  return ids.map((id) => ({ id: `${id}-${suffix}`, label: C[id].label, hex: C[id].hex }))
}

const SOLIDS_19: (keyof typeof C)[] = [
  'cotton', 'whiteSand', 'angora', 'khaki', 'biscuit', 'maize', 'tan', 'spice', 'cocoa',
  'willow', 'pomegranate', 'graySheen', 'steel', 'navy', 'black', 'plum', 'softWhite',
  'darkChocolate', 'whisper',
]
const SOLIDS_13: (keyof typeof C)[] = [
  'cotton', 'whiteSand', 'angora', 'khaki', 'biscuit', 'maize', 'willow', 'graySheen',
  'steel', 'navy', 'black', 'softWhite', 'whisper',
]
const TRIPLE_15: (keyof typeof C)[] = [
  'cotton', 'whiteSand', 'angora', 'khaki', 'biscuit', 'maize', 'tan', 'spice', 'cocoa',
  'willow', 'pomegranate', 'graySheen', 'steel', 'black', 'whisper',
]
const BLACKOUT_HALF_13: (keyof typeof C)[] = [
  'cotton', 'whiteSand', 'angora', 'khaki', 'biscuit', 'maize', 'cocoa', 'willow',
  'graySheen', 'steel', 'softWhite', 'darkChocolate', 'whisper',
]
const BLACKOUT_34_11: (keyof typeof C)[] = [
  'cotton', 'whiteSand', 'angora', 'khaki', 'biscuit', 'maize', 'willow', 'graySheen',
  'steel', 'softWhite', 'whisper',
]

const SHEER_COLORS: ColorOption[] = [
  { id: 'snow-white-sheer', label: 'Kar Beyazı', hex: '#F7F6F2' },
  { id: 'beach-beige-sheer', label: 'Kumsal Beji', hex: '#E5DCC7' },
  { id: 'moon-rock-sheer', label: 'Ay Taşı', hex: '#6A675F' },
  { id: 'pebble-sheer', label: 'Çakıl', hex: '#C9C7C0' },
]

const DESIGNER_PRINTS: ColorOption[] = [
  { id: 'sand-print', label: 'Kum', hex: '#D6C8B0', price: 350 },
  { id: 'mist-print', label: 'Sis', hex: '#BCBCC2', price: 350 },
  { id: 'sky-print', label: 'Gök', hex: '#9FB8CE', price: 350 },
  { id: 'cinder-print', label: 'Kül', hex: '#A89E94', price: 350 },
  { id: 'storm-print', label: 'Fırtına', hex: '#8A8F98', price: 350 },
]

/** Her ışık kontrolü × hücre tipi kombinasyonunun renk grupları. */
function getColorGroups(light: LightControlId, cell: CellTypeId): ColorGroup[] {
  if (light === 'sheer') {
    return [{ id: 'sheer', label: '1,9 cm (¾") Hücre · Tül Renkleri', colors: SHEER_COLORS }]
  }
  if (light === 'blackout') {
    return [
      { id: 'bo-half', label: '1,3 cm (½") Hücre · Karartma Renkleri', colors: colors(BLACKOUT_HALF_13, 'boh') },
      { id: 'bo-34', label: '1,9 cm (¾") Hücre · Karartma Renkleri', colors: colors(BLACKOUT_34_11, 'bo34') },
    ]
  }
  // Işık süzen
  if (cell === 'single') {
    return [
      { id: 'lf-half', label: '1,3 cm (½") Hücre · Standart Düz Renkler', colors: colors(SOLIDS_19, 'lfh') },
      { id: 'lf-34', label: '1,9 cm (¾") Hücre · Standart Düz Renkler', colors: colors(SOLIDS_13, 'lf34') },
      { id: 'lf-prints', label: '1,9 cm (¾") Hücre · Tasarım Desenleri', colors: DESIGNER_PRINTS },
    ]
  }
  if (cell === 'double') {
    return [
      { id: 'lf-38d', label: '1 cm (⅜") Hücre · Standart Düz Renkler', colors: colors(SOLIDS_19, 'lf38d') },
    ]
  }
  return [
    { id: 'lf-38t', label: '1 cm (⅜") Hücre · Standart Düz Renkler', colors: colors(TRIPLE_15, 'lf38t') },
  ]
}

// ---------------------------------------------------------------------------
// Fiyatlandırma — her kombinasyonun kendi fiyat tablosu var
// ---------------------------------------------------------------------------

interface PriceTable {
  base: number // taban fiyat (₺) — BASE_AREA_M2'ye kadar olan ölçüyü kapsar
  areaRatePerM2: number // taban alanı aşan her m² için ₺
}

const BASE_AREA_M2 = 0.56 // ~60×93 cm

const PRICE_TABLES: Record<string, PriceTable> = {
  'sheer-single': { base: 6500, areaRatePerM2: 4900 },
  'light-filtering-single': { base: 3600, areaRatePerM2: 2700 },
  'light-filtering-double': { base: 4250, areaRatePerM2: 3200 },
  'light-filtering-triple': { base: 5050, areaRatePerM2: 3800 },
  'blackout-single': { base: 4800, areaRatePerM2: 3600 },
  'blackout-double': { base: 5300, areaRatePerM2: 4000 },
}

const LIFT_SYSTEMS = [
  { id: 'cordless', label: 'İpsiz (Cordless)', desc: 'Elle itip çekerek kullanılır; çocuk güvenliği için en iyi seçenek.', price: 0 },
  { id: 'cord-loop', label: 'Sonsuz Zincir', desc: 'Zincirle kontrol; büyük ve yüksek pencereler için pratik.', price: 900 },
  { id: 'motorized', label: 'Motorlu', desc: 'Uzaktan kumanda ve akıllı ev entegrasyonu.', price: 7500 },
] as const

const TDBU_OPTIONS = [
  { id: 'none', label: 'Standart', desc: 'Perde yalnızca alttan yukarı toplanır.', price: 0 },
  { id: 'tdbu', label: 'Üstten Aç / Alttan Kapa (TDBU)', desc: 'Üstten de açılır; mahremiyeti korurken tepeden ışık alırsınız.', price: 2050 },
] as const

interface ConfigState {
  room: string
  mount: (typeof MOUNTS)[number]['id']
  widthCm: number
  heightCm: number
  lightControl: LightControlId
  cellType: CellTypeId
  color: ColorOption | null
  lift: (typeof LIFT_SYSTEMS)[number]['id']
  tdbu: (typeof TDBU_OPTIONS)[number]['id']
}

function computePrice(state: ConfigState) {
  const table = PRICE_TABLES[`${state.lightControl}-${state.cellType}`] ?? PRICE_TABLES['light-filtering-single']
  const areaM2 = (state.widthCm / 100) * (state.heightCm / 100)
  const sizeAdj = Math.max(0, (areaM2 - BASE_AREA_M2) * table.areaRatePerM2)
  const color = state.color?.price ?? 0
  const lift = LIFT_SYSTEMS.find((l) => l.id === state.lift)?.price ?? 0
  const tdbu = TDBU_OPTIONS.find((t) => t.id === state.tdbu)?.price ?? 0
  return {
    base: table.base,
    sizeAdj: Math.round(sizeAdj),
    color,
    lift,
    tdbu,
    total: Math.round(table.base + sizeAdj + color + lift + tdbu),
  }
}

// ---------------------------------------------------------------------------
// Canlı önizleme
// ---------------------------------------------------------------------------

function ShadePreview({ color, cellType, drop, sheer }: { color: ColorOption | null; cellType: string; drop: number; sheer: boolean }) {
  const fill = color?.hex ?? '#E8E1D0'
  const lineGap = cellType === 'single' ? 10 : cellType === 'double' ? 7 : 5
  const shadeHeight = 40 + drop * 190
  const lines = []
  for (let y = 58 + lineGap; y < 50 + shadeHeight; y += lineGap) {
    lines.push(y)
  }
  return (
    <svg viewBox="0 0 320 340" className="w-full max-w-sm" role="img" aria-label="Perde önizleme">
      <rect x="20" y="20" width="280" height="300" rx="4" fill="#FFFFFF" stroke="#D8D2C6" strokeWidth="6" />
      <rect x="40" y="40" width="240" height="260" fill="#EAF2F7" />
      <circle cx="90" cy="270" r="34" fill="#B9CDA4" opacity="0.8" />
      <circle cx="230" cy="280" r="44" fill="#A5BE8F" opacity="0.8" />
      <rect x="36" y="44" width="248" height="14" rx="3" fill="#C9BFAD" />
      <rect x="38" y="56" width="244" height={shadeHeight} fill={fill} opacity={sheer ? 0.55 : 1} />
      {lines.map((y) => (
        <line key={y} x1="38" x2="282" y1={y} y2={y} stroke="#000" strokeOpacity="0.08" strokeWidth="1.5" />
      ))}
      <rect x="36" y={52 + shadeHeight} width="248" height="8" rx="3" fill={fill} stroke="#000" strokeOpacity="0.15" />
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

export function CellularShadeConfigurator() {
  const [state, setState] = useState<ConfigState>({
    room: '',
    mount: 'inside',
    widthCm: 90,
    heightCm: 120,
    lightControl: 'light-filtering',
    cellType: 'single',
    color: null,
    lift: 'cordless',
    tdbu: 'none',
  })
  const [submitted, setSubmitted] = useState(false)

  const price = useMemo(() => computePrice(state), [state])
  const colorGroups = useMemo(
    () => getColorGroups(state.lightControl, state.cellType),
    [state.lightControl, state.cellType],
  )
  const availableCells = CELL_AVAILABILITY[state.lightControl]
  const drop = Math.min(1, Math.max(0.35, state.heightCm / 300))
  const dimsValid =
    state.widthCm >= 30 && state.widthCm <= 300 && state.heightCm >= 30 && state.heightCm <= 300
  const complete = state.color !== null && dimsValid

  function patch(p: Partial<ConfigState>) {
    setState((s) => {
      const next = { ...s, ...p }
      // Işık kontrolü değişince: hücre tipini geçerli sete indir, rengi sıfırla.
      if (p.lightControl && p.lightControl !== s.lightControl) {
        if (!CELL_AVAILABILITY[p.lightControl].includes(next.cellType)) {
          next.cellType = 'single'
        }
        next.color = null
      }
      // Hücre tipi değişince: seçili renk yeni palette yoksa sıfırla.
      if (p.cellType && p.cellType !== s.cellType) {
        const palette = getColorGroups(next.lightControl, next.cellType).flatMap((g) => g.colors)
        if (next.color && !palette.some((c) => c.id === next.color!.id)) {
          next.color = null
        }
      }
      return next
    })
    setSubmitted(false)
  }

  const lightLabel = LIGHT_CONTROLS.find((l) => l.id === state.lightControl)!.label
  const cellLabel = CELL_TYPES.find((c) => c.id === state.cellType)!.label

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
      {/* Sol: yapışkan önizleme + fiyat */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="flex flex-col items-center gap-4 rounded-xl border bg-muted/20 p-6">
          <ShadePreview
            color={state.color}
            cellType={state.cellType}
            drop={drop}
            sheer={state.lightControl === 'sheer'}
          />
          <div className="flex w-full items-center justify-between border-t pt-4">
            <div>
              <div className="text-sm text-muted-foreground">Hücreli Perde</div>
              <div className="text-2xl font-semibold">{formatTRY(price.total)}</div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <div>{state.widthCm} × {state.heightCm} cm · {lightLabel} · {cellLabel}</div>
              <div>{state.color ? state.color.label : 'Renk seçilmedi'}</div>
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
            <Label htmlFor="cfg-room">Oda / pencere adı</Label>
            <Input
              id="cfg-room"
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
              <Label htmlFor="cfg-width">Genişlik (cm)</Label>
              <Input
                id="cfg-width"
                type="number"
                min={30}
                max={300}
                value={state.widthCm}
                onChange={(e) => patch({ widthCm: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cfg-height">Yükseklik (cm)</Label>
              <Input
                id="cfg-height"
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

        <Step no="04" title="Işık Kontrolü">
          <div className="grid grid-cols-3 gap-3">
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
        </Step>

        <Step no="05" title="Hücre Tipi">
          <div className="grid grid-cols-3 gap-3">
            {CELL_TYPES.map((c) => {
              const available = availableCells.includes(c.id)
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={!available}
                  onClick={() => patch({ cellType: c.id })}
                  className={cn(
                    'rounded-lg border p-4 text-left transition-colors',
                    state.cellType === c.id && available
                      ? 'border-primary bg-primary/5'
                      : available
                        ? 'hover:bg-accent'
                        : 'cursor-not-allowed opacity-40',
                  )}
                >
                  <div className="text-sm font-medium">{c.label}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
                  {!available && (
                    <p className="mt-2 text-xs font-medium text-muted-foreground">
                      Bu kumaşta yok
                    </p>
                  )}
                </button>
              )
            })}
          </div>
          {CELL_UNAVAILABLE_NOTE[state.lightControl] && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Info className="size-3" /> {CELL_UNAVAILABLE_NOTE[state.lightControl]}
            </p>
          )}
        </Step>

        <Step no="06" title="Renk">
          <div className="space-y-5">
            {colorGroups.map((group) => (
              <div key={group.id}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </h3>
                <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
                  {group.colors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      title={color.label + (color.price ? ` (+${formatTRY(color.price)})` : '')}
                      onClick={() => patch({ color })}
                      className={cn(
                        'group flex flex-col items-center gap-1 rounded-md p-1 transition-colors hover:bg-accent',
                        state.color?.id === color.id && 'bg-accent',
                      )}
                    >
                      <span
                        className={cn(
                          'relative block h-9 w-full rounded border',
                          state.color?.id === color.id && 'ring-2 ring-primary ring-offset-1',
                        )}
                        style={{ backgroundColor: color.hex }}
                      >
                        {state.color?.id === color.id && (
                          <Check className="absolute inset-0 m-auto size-4 text-white mix-blend-difference" />
                        )}
                      </span>
                      <span className="w-full truncate text-center text-[10px] leading-tight text-muted-foreground">
                        {color.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Renkler seçtiğiniz ışık kontrolü ve hücre tipine göre değişir. Ekran renkleri ışığa
              göre farklılık gösterebilir — emin olmak için ücretsiz kumaş örneği isteyin.
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

        <Step no="09" title="Özet">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Teklifiniz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <QuoteRow
                label="Taban fiyat"
                sub={`${lightLabel} · ${cellLabel} — kombinasyona özel fiyat tablosu`}
                value={formatTRY(price.base)}
              />
              <QuoteRow
                label="Ölçü farkı"
                sub={`${state.widthCm} × ${state.heightCm} cm`}
                value={price.sizeAdj ? `+${formatTRY(price.sizeAdj)}` : 'Dahil'}
              />
              <QuoteRow
                label="Renk"
                sub={state.color?.label ?? 'Seçilmedi'}
                value={price.color ? `+${formatTRY(price.color)}` : 'Dahil'}
              />
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
              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-medium">Tahmini Toplam</span>
                <span className="text-2xl font-semibold">{formatTRY(price.total)}</span>
              </div>

              {!complete && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                  {!state.color && <div>Renk seçilmedi.</div>}
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
