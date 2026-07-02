'use client'

// Ana sayfa asistanı — ChatGPT benzeri deneyim:
//  - Boş durumda: ortalanmış karşılama başlığı + büyük hap girişi + öneriler
//  - Sohbet başlayınca: mesaj akışı (kullanıcı sağda balon, asistan solda
//    avatarlı düz metin) ve altta sabit giriş kutusu

import { useEffect, useRef, useState } from 'react'
import { ArrowUp, BadgeCheck, Sparkles, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { formatTRY } from '@/lib/format'
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

function AssistantAvatar() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-background">
      <Sparkles className="size-4 text-primary" />
    </div>
  )
}

function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
  autoFocus,
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled: boolean
  autoFocus?: boolean
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="flex w-full items-center gap-2 rounded-full border bg-background py-2 pl-5 pr-2 shadow-sm transition-shadow focus-within:shadow-md"
    >
      <input
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder="İhtiyacınızı yazın…"
        className="h-9 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Gönder"
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full transition-colors',
          value.trim() && !disabled
            ? 'bg-primary text-primary-foreground hover:bg-primary/85'
            : 'bg-muted text-muted-foreground',
        )}
      >
        <ArrowUp className="size-4" />
      </button>
    </form>
  )
}

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
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
          messages: next.map(({ role, content }) => ({ role, content })),
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

  // ---------------------------------------------------------------------------
  // Boş durum — ChatGPT benzeri ortalanmış karşılama
  // ---------------------------------------------------------------------------
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8 pb-24">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Size nasıl yardımcı olabilirim?
          </h1>
          <p className="text-sm text-muted-foreground">
            İhtiyacınızı yazın — ağımızdaki üretici, atölye ve montaj ekipleri arasından en uygun
            eşleşmeyi bulayım.
          </p>
        </div>
        <div className="w-full max-w-2xl">
          <ChatInput value={input} onChange={setInput} onSubmit={() => send(input)} disabled={loading} autoFocus />
        </div>
        <div className="flex max-w-2xl flex-wrap justify-center gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border bg-background px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Sohbet görünümü
  // ---------------------------------------------------------------------------
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto px-1 py-8">
        {messages.map((m, i) =>
          m.role === 'user' ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[75%] rounded-3xl bg-muted px-4 py-2.5 text-[15px]">
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ) : (
            <div key={i} className="flex gap-3">
              <AssistantAvatar />
              <div className="min-w-0 flex-1 space-y-3 pt-1">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                  {m.content.split('**').map((part, j) =>
                    j % 2 === 1 ? <strong key={j}>{part}</strong> : part,
                  )}
                </p>
                {m.matches && m.matches.length > 0 && (
                  <div className="space-y-2">
                    {m.matches.map((match) => (
                      <Card key={match.provider.id} className="py-3">
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
                              {formatTRY(match.estimatedPrice)}
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
          ),
        )}
        {loading && (
          <div className="flex items-center gap-3">
            <AssistantAvatar />
            <div className="flex items-center gap-1 pt-1">
              <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
              <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
              <span className="size-2 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      <div className="pb-4 pt-2">
        <ChatInput value={input} onChange={setInput} onSubmit={() => send(input)} disabled={loading} />
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Asistan eşleştirmeleri fiyat, termin, kapasite, fire, lojistik ve puana göre yapar.
        </p>
      </div>
    </div>
  )
}
