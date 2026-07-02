'use client'

// Made-to-measure cellular shade configurator (Carra Woods product).
// Eight-step wizard modeled on industry-standard cellular shade ordering flows:
// room → mount → dimensions → light control → cell type → color → lift → quote.
// Pricing is computed live from base price + size adjustment + option deltas.

import { useMemo, useState } from 'react'
import { BadgeCheck, Check, Info, ShieldCheck, Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatTRY } from '@/lib/format'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Option data
// ---------------------------------------------------------------------------

const ROOMS = [
  'Oturma Odası',
  'Bebek Odası',
  'Mutfak',
  'Yemek Odası',
  'Yatak Odası',
  'Banyo',
  'Çalışma Odası',
  'Diğer',
]

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

const LIGHT_CONTROLS = [
  { id: 'sheer', label: 'Tül Geçirgen', desc: 'Işığı yumuşatır, manzarayı korur.', price: 0 },
  { id: 'light-filtering', label: 'Işık Süzen', desc: 'Güneşi süzer, gündüz mahremiyeti sağlar.', price: 0 },
  { id: 'blackout', label: 'Karartma', desc: 'Işığı büyük ölçüde engeller; yatak odası için ideal.', price: 600 },
] as const

const CELL_TYPES = [
  { id: 'single', label: 'Tek Hücre', desc: 'İnce profil, standart yalıtım.', price: 0 },
  { id: 'double', label: 'Çift Hücre', desc: 'Güçlü yalıtım, üstün ses sönümleme.', price: 950 },
  { id: 'triple', label: 'Üç Hücre', desc: 'Sert iklimler için maksimum enerji verimliliği.', price: 1700 },
] as const

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

const COLOR_GROUPS: ColorGroup[] = [
  {
    id: 'half-solids',
    label: '1,3 cm (½") Hücre · Standart Düz Renkler',
    colors: [
      { id: 'cotton', label: 'Pamuk', hex: '#F4F1E8' },
      { id: 'white-sand', label: 'Beyaz Kum', hex: '#E8E1D0' },
      { id: 'angora', label: 'Angora', hex: '#D9CCB4' },
      { id: 'khaki', label: 'Haki', hex: '#C2B08D' },
      { id: 'biscuit', label: 'Bisküvi', hex: '#C9A470' },
      { id: 'maize', label: 'Mısır', hex: '#C68E4C' },
      { id: 'tan', label: 'Taba', hex: '#B57B3F' },
      { id: 'spice', label: 'Baharat', hex: '#A34B2B' },
      { id: 'cocoa', label: 'Kakao', hex: '#6C4B37' },
      { id: 'willow', label: 'Söğüt', hex: '#8A8C5B' },
      { id: 'pomegranate', label: 'Nar', hex: '#8E3A3C' },
      { id: 'gray-sheen', label: 'Gri Şimmer', hex: '#B9B8B3' },
      { id: 'steel', label: 'Çelik', hex: '#5A6470' },
      { id: 'navy', label: 'Lacivert', hex: '#3A4458' },
      { id: 'black', label: 'Siyah', hex: '#2B2B2B' },
      { id: 'plum', label: 'Erik', hex: '#4E3A4E' },
      { id: 'soft-white', label: 'Yumuşak Beyaz', hex: '#EFEDE4' },
      { id: 'dark-chocolate', label: 'Bitter Çikolata', hex: '#3E2F28' },
      { id: 'whisper', label: 'Fısıltı', hex: '#D8D8D0' },
    ],
  },
  {
    id: 'threequarter-solids',
    label: '1,9 cm (¾") Hücre · Standart Düz Renkler',
    colors: [
      { id: 'cotton-34', label: 'Pamuk', hex: '#F4F1E8' },
      { id: 'white-sand-34', label: 'Beyaz Kum', hex: '#E8E1D0' },
      { id: 'angora-34', label: 'Angora', hex: '#D9CCB4' },
      { id: 'khaki-34', label: 'Haki', hex: '#C2B08D' },
      { id: 'biscuit-34', label: 'Bisküvi', hex: '#C9A470' },
      { id: 'maize-34', label: 'Mısır', hex: '#C68E4C' },
      { id: 'willow-34', label: 'Söğüt', hex: '#8A8C5B' },
      { id: 'gray-sheen-34', label: 'Gri Şimmer', hex: '#B9B8B3' },
      { id: 'steel-34', label: 'Çelik', hex: '#5A6470' },
      { id: 'navy-34', label: 'Lacivert', hex: '#3A4458' },
      { id: 'black-34', label: 'Siyah', hex: '#2B2B2B' },
      { id: 'soft-white-34', label: 'Yumuşak Beyaz', hex: '#EFEDE4' },
      { id: 'whisper-34', label: 'Fısıltı', hex: '#D8D8D0' },
    ],
  },
  {
    id: 'designer-prints',
    label: '1,9 cm (¾") Hücre · Tasarım Desenleri',
    colors: [
      { id: 'sand-print', label: 'Kum', hex: '#D6C8B0', price: 350 },
      { id: 'mist-print', label: 'Sis', hex: '#BCBCC2', price: 350 },
      { id: 'sky-print', label: 'Gök', hex: '#9FB8CE', price: 350 },
      { id: 'cinder-print', label: 'Kül', hex: '#A89E94', price: 350 },
      { id: 'storm-print', label: 'Fırtına', hex: '#8A8F98', price: 350 },
    ],
  },
]

const LIFT_SYSTEMS = [
  { id: 'cordless', label: 'İpsiz (Cordless)', desc: 'Elle itip çekerek kullanılır; çocuk güvenliği için en iyi seçenek.', price: 0 },
  { id: 'cord-loop', label: 'Sonsuz Zincir', desc: 'Zincirle kontrol; büyük ve yüksek pencereler için pratik.', price: 900 },
  { id: 'motorized', label: 'Motorlu', desc: 'Uzaktan kumanda ve akıllı ev entegrasyonu.', price: 7500 },
] as const

const TDBU_OPTIONS = [
  { id: 'none', label: 'Standart', desc: 'Perde yalnızca alttan yukarı toplanır.', price: 0 },
  { id: 'tdbu', label: 'Üstten Aç / Alttan Kapa (TDBU)', desc: 'Üstten de açılır; mahremiyeti korurken tepeden ışık alırsınız.', price: 2050 },
] as const

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

const BASE_PRICE = 3600
const BASE_AREA_M2 = 0.56 // baz fiyat ~60×93 cm'e kadar olan ölçüyü kapsar
const AREA_RATE_PER_M2 = 2700

function computePrice(state: ConfigState) {
  const areaM2 = (state.widthCm / 100) * (state.heightCm / 100)
  const sizeAdj = Math.max(0, (areaM2 - BASE_AREA_M2) * AREA_RATE_PER_M2)
  const light = LIGHT_CONTROLS.find((l) => l.id === state.lightControl)?.price ?? 0
  const cell = CELL_TYPES.find((c) => c.id === state.cellType)?.price ?? 0
  const color = state.color?.price ?? 0
  const lift = LIFT_SYSTEMS.find((l) => l.id === state.lift)?.price ?? 0
  const tdbu = TDBU_OPTIONS.find((t) => t.id === state.tdbu)?.price ?? 0
  const total = BASE_PRICE + sizeAdj + light + cell + color + lift + tdbu
  return {
    sizeAdj: round2(sizeAdj),
    light,
    cell,
    color,
    lift,
    tdbu,
    total: round2(total),
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

interface ConfigState {
  room: string
  mount: (typeof MOUNTS)[number]['id']
  widthCm: number
  heightCm: number
  lightControl: (typeof LIGHT_CONTROLS)[number]['id']
  cellType: (typeof CELL_TYPES)[number]['id']
  color: ColorOption | null
  lift: (typeof LIFT_SYSTEMS)[number]['id']
  tdbu: (typeof TDBU_OPTIONS)[number]['id']
}

// ---------------------------------------------------------------------------
// Live preview
// ---------------------------------------------------------------------------

function ShadePreview({ color, cellType, drop }: { color: ColorOption | null; cellType: string; drop: number }) {
  const fill = color?.hex ?? '#E8E1D0'
  const lineGap = cellType === 'single' ? 10 : cellType === 'double' ? 7 : 5
  const shadeHeight = 40 + drop * 190
  const lines = []
  for (let y = 58 + lineGap; y < 50 + shadeHeight; y += lineGap) {
    lines.push(y)
  }
  return (
    <svg viewBox="0 0 320 340" className="w-full max-w-sm" role="img" aria-label="Perde önizleme">
      {/* window frame */}
      <rect x="20" y="20" width="280" height="300" rx="4" fill="#FFFFFF" stroke="#D8D2C6" strokeWidth="6" />
      <rect x="40" y="40" width="240" height="260" fill="#EAF2F7" />
      {/* view */}
      <circle cx="90" cy="270" r="34" fill="#B9CDA4" opacity="0.8" />
      <circle cx="230" cy="280" r="44" fill="#A5BE8F" opacity="0.8" />
      {/* headrail */}
      <rect x="36" y="44" width="248" height="14" rx="3" fill="#C9BFAD" />
      {/* shade */}
      <rect x="38" y="56" width="244" height={shadeHeight} fill={fill} />
      {lines.map((y) => (
        <line key={y} x1="38" x2="282" y1={y} y2={y} stroke="#000" strokeOpacity="0.08" strokeWidth="1.5" />
      ))}
      {/* bottom rail */}
      <rect x="36" y={52 + shadeHeight} width="248" height="8" rx="3" fill={fill} stroke="#000" strokeOpacity="0.15" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Step section wrapper
// ---------------------------------------------------------------------------

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
// Main configurator
// ---------------------------------------------------------------------------

export function CellularShadeConfigurator() {
  const [state, setState] = useState<ConfigState>({
    room: 'Oturma Odası',
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
  const drop = Math.min(1, Math.max(0.35, state.heightCm / 300))
  const dimsValid =
    state.widthCm >= 30 && state.widthCm <= 300 && state.heightCm >= 30 && state.heightCm <= 300
  const complete = state.color !== null && dimsValid

  function patch(p: Partial<ConfigState>) {
    setState((s) => ({ ...s, ...p }))
    setSubmitted(false)
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
      {/* Left: sticky preview + price bar */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="flex flex-col items-center gap-4 rounded-xl border bg-muted/20 p-6">
          <ShadePreview color={state.color} cellType={state.cellType} drop={drop} />
          <div className="flex w-full items-center justify-between border-t pt-4">
            <div>
              <div className="text-sm text-muted-foreground">Hücreli Perde</div>
              <div className="text-2xl font-semibold">{formatTRY(price.total)}</div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <div>{state.widthCm} × {state.heightCm} cm · {MOUNTS.find((m) => m.id === state.mount)?.label}</div>
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

      {/* Right: wizard */}
      <div className="space-y-10">
        <Step no="01" title="Oda">
          <div className="grid grid-cols-4 gap-2">
            {ROOMS.map((room) => (
              <button
                key={room}
                type="button"
                onClick={() => patch({ room })}
                className={cn(
                  'rounded-lg border px-2 py-3 text-xs font-medium transition-colors',
                  state.room === room
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'text-muted-foreground hover:bg-accent',
                )}
              >
                {room}
              </button>
            ))}
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
                <p className="mt-2 text-xs font-medium">{l.price ? `+${formatTRY(l.price)}` : 'Ücretsiz'}</p>
              </button>
            ))}
          </div>
        </Step>

        <Step no="05" title="Hücre Tipi">
          <div className="grid grid-cols-3 gap-3">
            {CELL_TYPES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => patch({ cellType: c.id })}
                className={cn(
                  'rounded-lg border p-4 text-left transition-colors',
                  state.cellType === c.id ? 'border-primary bg-primary/5' : 'hover:bg-accent',
                )}
              >
                <div className="text-sm font-medium">{c.label}</div>
                <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
                <p className="mt-2 text-xs font-medium">{c.price ? `+${formatTRY(c.price)}` : 'Ücretsiz'}</p>
              </button>
            ))}
          </div>
        </Step>

        <Step no="06" title="Renk">
          <div className="space-y-5">
            {COLOR_GROUPS.map((group) => (
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
              Ekran renkleri ışığa göre değişebilir — emin olmak için ücretsiz kumaş örneği isteyin.
            </p>
          </div>
        </Step>

        <Step no="07" title="Kaldırma Sistemi">
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

        <Step no="08" title="Özet & Fiyat">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Teklifiniz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <QuoteRow label="Baz fiyat" sub="Ölçü ve seçenekler öncesi başlangıç" value={formatTRY(BASE_PRICE)} />
              <QuoteRow
                label="Ölçü farkı"
                sub={`${state.widthCm} × ${state.heightCm} cm`}
                value={price.sizeAdj ? `+${formatTRY(price.sizeAdj)}` : 'Dahil'}
              />
              <QuoteRow label="Işık kontrolü" sub={LIGHT_CONTROLS.find((l) => l.id === state.lightControl)!.label} value={price.light ? `+${formatTRY(price.light)}` : 'Ücretsiz'} />
              <QuoteRow label="Hücre tipi" sub={CELL_TYPES.find((c) => c.id === state.cellType)!.label} value={price.cell ? `+${formatTRY(price.cell)}` : 'Ücretsiz'} />
              <QuoteRow label="Renk" sub={state.color?.label ?? 'Seçilmedi'} value={price.color ? `+${formatTRY(price.color)}` : 'Ücretsiz'} />
              <QuoteRow label="Kontrol" sub={LIFT_SYSTEMS.find((l) => l.id === state.lift)!.label} value={price.lift ? `+${formatTRY(price.lift)}` : 'Ücretsiz'} />
              <QuoteRow label="TDBU" sub={TDBU_OPTIONS.find((t) => t.id === state.tdbu)!.label} value={price.tdbu ? `+${formatTRY(price.tdbu)}` : 'Ücretsiz'} />
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
