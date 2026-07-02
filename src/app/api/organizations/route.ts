import { NextResponse } from 'next/server'
import { getProviders } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const providers = await getProviders()
  return NextResponse.json({ data: providers })
}
