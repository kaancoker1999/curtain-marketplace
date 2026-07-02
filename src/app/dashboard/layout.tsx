import Link from 'next/link'
import {
  LayoutDashboard,
  Network,
  Package,
  ShoppingCart,
  Sparkles,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { getStats } from '@/lib/data'

export const dynamic = 'force-dynamic'

const nav = [
  { href: '/dashboard', label: 'Genel Bakış', icon: LayoutDashboard },
  { href: '/dashboard/match', label: 'AI Eşleştirme', icon: Sparkles },
  { href: '/dashboard/marketplace', label: 'Pazar Yeri', icon: Package },
  { href: '/ureticiler', label: 'Üretici Ağı', icon: Network },
  { href: '/dashboard/orders', label: 'Siparişler', icon: ShoppingCart },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const stats = await getStats()
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="flex flex-1">
        <aside className="hidden w-60 shrink-0 flex-col border-r bg-muted/30 px-4 py-6 md:flex">
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto px-2">
            {stats.demoMode && (
              <Badge variant="outline" className="w-full justify-center">
                Demo mod — veritabanı yok
              </Badge>
            )}
          </div>
        </aside>
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  )
}
