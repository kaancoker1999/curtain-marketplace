import { ChatPanel } from '@/components/chat/chat-panel'
import { SiteHeader } from '@/components/site-header'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-6">
        <ChatPanel />
      </main>
    </div>
  )
}
