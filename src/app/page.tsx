
import type { Metadata } from 'next'
import HomeClient from './HomeClient'
import type { Venue } from './HomeClient'
import { createPublicServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    absolute:
      'ライブ・イベント会場周辺のホテル検索｜ライブ会場ホテルサーチ',
  },
  description:
    'ライブ・コンサート・イベント会場から近いホテルを検索。会場と検索範囲を選び、周辺の宿泊施設を距離で探せます。',
  alternates: {
    canonical: 'https://live-stay-search.vercel.app/',
  },
}

export default async function HomePage() {
  const supabase = createPublicServerClient()

  const { data: venueData, error: venueError } = await supabase
    .from('venues')
    .select('id, name, prefecture, address')
    .order('name')
    .returns<Venue[]>()

  if (venueError) {
    console.error('会場一覧の取得に失敗:', venueError.message)
    throw new Error('会場情報を取得できませんでした。')
  }

  const venues = venueData ?? []

  return (
    <HomeClient
      venues={venues}
      initialSelectedVenue={venues[0]?.name ?? ''}
      initialHotels={[]}
      initialRadius={3000}
    />
  )
}