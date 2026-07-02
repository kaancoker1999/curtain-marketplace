import { redirect } from 'next/navigation'

// Üretici ağı artık tek yerden yönetiliyor: /ureticiler
export default function NetworkPage() {
  redirect('/ureticiler')
}
