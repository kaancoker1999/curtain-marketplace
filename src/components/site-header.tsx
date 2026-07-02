'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/ureticiler', label: 'Üreticiler' },
  { href: '/calistigim-ureticiler', label: 'Çalıştığım Üreticiler' },
  { href: '/dashboard/marketplace', label: 'Pazar Yeri' },
  { href: '/dashboard/orders', label: 'Siparişler' },
]

export function SiteHeader() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Curtain<span className="text-primary">OS</span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-accent-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
          >
            <LayoutDashboard className="size-4" /> Panel
          </Link>
        </div>
      </div>
    </header>
  )
}
