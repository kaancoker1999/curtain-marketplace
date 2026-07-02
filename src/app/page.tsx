import Link from 'next/link'
import { ArrowRight, Factory, Ruler, Scissors, Sparkles, Truck, Wrench } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const capabilities = [
  {
    icon: Factory,
    title: 'Manufacturers',
    text: 'Order finished curtains at scale from verified production partners.',
  },
  {
    icon: Scissors,
    title: 'Sewing workshops',
    text: 'Book only the sewing or pleating capacity you need, when you need it.',
  },
  {
    icon: Ruler,
    title: 'Fabric suppliers',
    text: 'Source drapery, sheer and blackout fabric with live stock levels.',
  },
  {
    icon: Wrench,
    title: 'Installers',
    text: 'Dispatch certified installation teams matched by service radius.',
  },
  {
    icon: Truck,
    title: 'Logistics',
    text: 'Distance-aware matching keeps shipping cost and lead time down.',
  },
  {
    icon: Sparkles,
    title: 'AI matching',
    text: 'Price, capacity, waste, logistics and rating — scored in one engine.',
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="text-lg font-semibold tracking-tight">
          Curtain<span className="text-primary">OS</span>
        </div>
        <Button render={<Link href="/dashboard" />}>
          Open dashboard <ArrowRight className="ml-1 size-4" />
        </Button>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center">
        <Badge variant="secondary" className="mb-4">
          B2B operating system for the curtain industry
        </Badge>
        <h1 className="mx-auto max-w-3xl text-balance text-5xl font-bold tracking-tight">
          One platform connecting the entire curtain supply chain
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
          Retailers, manufacturers, sewing workshops, fabric suppliers and installers — matched
          intelligently on price, delivery time, production capacity, waste optimization,
          logistics and rating.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button size="lg" render={<Link href="/dashboard/match" />}>
            Try the AI matching engine
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/dashboard/marketplace" />}>
            Browse the marketplace
          </Button>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {capabilities.map((cap) => (
          <Card key={cap.title}>
            <CardHeader className="flex flex-row items-center gap-3">
              <cap.icon className="size-5 text-primary" />
              <CardTitle className="text-base">{cap.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{cap.text}</CardContent>
          </Card>
        ))}
      </section>
    </main>
  )
}
