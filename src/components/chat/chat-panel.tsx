'use client'

import { useEffect, useRef, useState } from 'react'
import { BadgeCheck, Loader2, SendHorizonal, Sparkles, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ChatMatch {
  rank: number
  totalScore: number
  estimatedPrice: number
  estimatedLeadTimeDays: number
  distanceKm: number
  provider: {
    id: string
    name: string
    city: string
    verified: boolean
    ratingAvg: number
    ratingCount: number
    roles: string[]
  }
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  matches?: ChatMatch[]
}

const SUGGESTIONS = [
  "İstanbul'a 21 gün içinde 60 adet 160x260 karartma perde diktirmek istiyorum",
  "İzmir'de 25 metre ray montajı için usta arıyorum",
  "Ankara'da otel projesi için perde tasarımı yaptırmak istiyorum",
]

const WELCOME: ChatMessage = {
  role: 'assistant',
  content:
    'Merhaba! Ben CurtainOS asistanıyım. İhtiyacınızı yazın — ağımızdaki üretici, atölye ve montaj ' +
    'ekipleri arasından fiyat, termin, kapasite, fire, lojistik ve puana göre en uygun eşleşmeyi bulayım.',
}

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function send(text: string) {
    const content = text.trim()
    if (!content || loading) return
    const next: ChatMessage[] = [...messages, { role: 'user', content }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.slice(1).map(({ role, content }) => ({ role, content })),
        }),
      })
      if (!res.ok) throw new Error(`Sunucu hatası (${res.status})`)
      const body = await res.json()
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: body.data.reply, matches: body.data.matches },
      ])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Bir sorun oluştu, lütfen tekrar deneyin.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-1 py-6">
        {messages.map((m, i) => (
          <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[85%] space-y-3',
                m.role === 'user'
                  ? 'rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground'
                  : 'rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm',
              )}
            >
              <p className="whitespace-pre-wrap">
                {m.content.split('**').map((part, j) =>
                  j % 2 === 1 ? <strong key={j}>{part}</strong> : part,
                )}
              </p>
              {m.matches && m.matches.length > 0 && (
                <div className="space-y-2">
                  {m.matches.map((match) => (
                    <Card key={match.provider.id} className="bg-background py-3">
                      <CardContent className="space-y-1.5 px-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-sm font-semibold">
                            <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                              {match.rank}
                            </span>
                            {match.provider.name}
                            {match.provider.verified && (
                              <BadgeCheck className="size-3.5 text-primary" />
                            )}
                          </span>
                          <Badge variant="secondary">
                            Skor {Math.round(match.totalScore * 100)}/100
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>{match.provider.city}</span>
                          <span>·</span>
                          <span className="font-medium text-foreground">
                            ${match.estimatedPrice.toLocaleString('en-US')}
                          </span>
                          <span>·</span>
                          <span>{match.estimatedLeadTimeDays} gün teslim</span>
                          <span>·</span>
                          <span>{match.distanceKm} km</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                            {match.provider.ratingAvg.toFixed(1)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Eşleştiriliyor…
            </div>
          </div>
        )}
      </div>

      {messages.length === 1 && (
        <div className="flex flex-wrap justify-center gap-2 pb-4">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex items-center gap-2 border-t pt-4"
      >
        <Sparkles className="size-4 shrink-0 text-primary" />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="İhtiyacınızı yazın… (örn. İstanbul'a 60 adet 160x260 perde dikimi, 21 gün)"
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={loading || !input.trim()}>
          <SendHorizonal className="size-4" />
        </Button>
      </form>
    </div>
  )
}
