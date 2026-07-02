import { NextResponse } from 'next/server'
import { getFabrics } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const fabrics = await getFabrics()
  return NextResponse.json({ data: fabrics })
}
