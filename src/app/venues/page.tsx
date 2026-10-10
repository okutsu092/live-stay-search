import type { Metadata } from 'next'
import VenuesContent from './VenuesClient'
import { createPublicServerClient } from '@/lib/supabase-server'


export const dynamic = 'force-dynamic'


export const metadata: Metadata = {
  title: {
    absolute:
      'ライブ・イベント会場一覧｜ライブ会場ホテルサーチ',
  },


  description:
    'ライブ・コンサート・イベント会場の一覧から、周辺のホテルを探せます。参加する会場を選んで、近くの宿泊施設を検索してください。',


  alternates: {
    canonical: 'https://live-stay-search.vercel.app/venues',
  },
}

type Venue = {
  id: number
  name: string
  prefecture: string | null
  address: string | null
}

export default async function VenuesPage() {
  const supabase = createPublicServerClient()


  const { data, error } = await supabase
    .from('venues')
    .select('id, name, prefecture, address')    
    .order('name')
    .returns<Venue[]>()


  if (error) {
    console.error('会場一覧の取得に失敗:', error.message)
    throw new Error('会場情報を取得できませんでした。')
  }


  return <VenuesContent venues={data ?? []} />
}