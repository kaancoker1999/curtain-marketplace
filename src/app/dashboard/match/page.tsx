'use client'

import { useState } from 'react'
import { BadgeCheck, Loader2, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface MatchResultRow {
  rank: number
  totalScore: number
  scores: Record<'price' | 'delivery' | 'capacity' | 'waste' | 'logistics' | 'rating', number>
  estimatedPrice: number
  estimatedLeadTimeDays: number
  distanceKm: number
  explanation: string
  provider: {
    id: string
    name: string
    city: string
    country: string
    roles: string[]
    verified: boolean
    ratingAvg: number
    ratingCount: number
  }
}

const SERVICE_TYPES = [
  { value: 'SEWING', label: 'Sewing' },
  { value: 'INSTALLATION', label: 'Installation' },
  { value: 'MEASUREMENT', label: 'Measurement' },
  { value: 'DESIGN', label: 'Design' },
  { value: 'PLEATING', label: 'Pleating' },
  { value: 'EMBROIDERY', label: 'Embroidery' },
  { value: 'MOTORIZATION', label: 'Motorization' },
]

const SCORE_LABELS: [keyof MatchResultRow['scores'], string][] = [
  ['price', 'Price'],
  ['delivery', 'Delivery'],
  ['capacity', 'Capacity'],
  ['waste', 'Waste opt.'],
  ['logistics', 'Logistics'],
  ['rating', 'Rating'],
]

export default function MatchPage() {
  const [form, setForm] = useState({
    serviceType: 'SEWING',
    widthCm: '160',
    heightCm: '260',
    quantity: '60',
    deliveryCity: 'Istanbul',
    neededInDays: '21',
    budgetMax: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<MatchResultRow[] | null>(null)
  const [aiSummary, setAiSummary] = useState<string | null>(null)

  function set(field: keyof typeof form) {
    return (value: string) => setForm((f) => ({ ...f, [field]: value }))
  }

  async function runMatch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: form.serviceType,
          widthCm: Number(form.widthCm),
          heightCm: Number(form.heightCm),
          quantity: Number(form.quantity),
          deliveryCity: form.deliveryCity,
          neededInDays: form.neededInDays ? Number(form.neededInDays) : undefined,
          budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? `Request failed (${res.status})`)
      }
      const body = await res.json()
      setResults(body.data.results)
      setAiSummary(body.data.aiSummary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Match request failed')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Sparkles className="size-5 text-primary" /> AI Matching
        </h1>
        <p className="text-sm text-muted-foreground">
          Describe what you need — the engine ranks providers by price, delivery, capacity,
          fabric-waste efficiency, logistics and rating.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request</CardTitle>
          <CardDescription>Example: 60 made-to-measure blackout panels for a hotel project.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={runMatch} className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="col-span-2 space-y-2">
              <Label>Service</Label>
              <Select
                value={form.serviceType}
                onValueChange={(value) => value && set('serviceType')(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">Width (cm)</Label>
              <Input id="width" type="number" min={1} required value={form.widthCm}
                onChange={(e) => set('widthCm')(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" type="number" min={1} required value={form.heightCm}
                onChange={(e) => set('heightCm')(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input id="qty" type="number" min={1} required value={form.quantity}
                onChange={(e) => set('quantity')(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Delivery city</Label>
              <Input id="city" required value={form.deliveryCity}
                onChange={(e) => set('deliveryCity')(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Needed in (days)</Label>
              <Input id="days" type="number" min={1} value={form.neededInDays}
                onChange={(e) => set('neededInDays')(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget max ($)</Label>
              <Input id="budget" type="number" min={1} placeholder="optional" value={form.budgetMax}
                onChange={(e) => set('budgetMax')(e.target.value)} />
            </div>
            <div className="col-span-2 flex items-end md:col-span-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-1 size-4 animate-spin" />}
                Find best providers
              </Button>
            </div>
          </form>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {aiSummary && (
        <Card className="border-primary/40">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-primary" /> AI recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{aiSummary}</CardContent>
        </Card>
      )}

      {results && (
        <div className="space-y-4">
          {results.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No providers offer this service yet.
            </p>
          )}
          {results.map((r) => (
            <Card key={r.provider.id} className={r.rank === 1 ? 'border-primary' : undefined}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {r.rank}
                    </span>
                    {r.provider.name}
                    {r.provider.verified && <BadgeCheck className="size-4 text-primary" />}
                    {r.rank === 1 && <Badge>Best match</Badge>}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Score <span className="font-semibold text-foreground">{Math.round(r.totalScore * 100)}</span>/100
                  </div>
                </div>
                <CardDescription>
                  {r.provider.city}, {r.provider.country} · {r.distanceKm} km away · est.{' '}
                  <span className="font-medium text-foreground">
                    ${r.estimatedPrice.toLocaleString('en-US')}
                  </span>{' '}
                  · {r.estimatedLeadTimeDays}d lead time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {SCORE_LABELS.map(([key, label]) => (
                    <div key={key}>
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>{label}</span>
                        <span>{Math.round(r.scores[key] * 100)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div
                          className="h-1.5 rounded-full bg-primary"
                          style={{ width: `${Math.round(r.scores[key] * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{r.explanation}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
