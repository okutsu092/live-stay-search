import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import HomeClient from '@/app/HomeClient'
import type { Hotel, Venue } from '@/app/HomeClient'
import { createPublicServerClient } from '@/lib/supabase-server'


export const dynamic = 'force-dynamic'


const baseUrl = 'https://live-stay-search.vercel.app'


type VenuePageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    [key: string]: string | string[] | undefined
  }>
}


// 同一リクエスト内では、metadataと本文で取得結果を共有します。
const getVenues = cache(async (): Promise<Venue[]> => {
  const supabase = createPublicServerClient()


  const { data, error } = await supabase
    .from('venues')
    .select('id, name')
    .order('name')
    .returns<Venue[]>()


  if (error) {
    console.error('会場一覧の取得に失敗:', error.message)
    throw new Error('会場情報を取得できませんでした。')
  }


  return data ?? []
})


async function getVenue(id: string) {
  const venues = await getVenues()
  const venue = venues.find((item) => String(item.id) === id)


  if (!venue) {
    notFound()
  }


  return { venue, venues }
}


export async function generateMetadata({
  params,
}: VenuePageProps): Promise<Metadata> {
  const { id } = await params
  const { venue } = await getVenue(id)


  return {
    title: {
      absolute:
        `${venue.name}周辺のホテル検索｜ライブ会場ホテルサーチ`,
    },


    description:
      `${venue.name}周辺のホテルを検索。会場から1km・3km・5km以内の宿泊施設を探せます。ライブやイベント参加時のホテル選びにご利用ください。`,


    alternates: {
      canonical: `baseUrl/venues/{venue.id}`,
    },
  }
}


export default async function VenuePage({
  params,
  searchParams,
}: VenuePageProps) {
  const { id } = await params
  const query = await searchParams


  const { venue, venues } = await getVenue(id)


  const radiusValue = Array.isArray(query.radius)
    ? query.radius[0]
    : query.radius


  const requestedRadius = Number(radiusValue)


  const radius = [1000, 3000, 5000].includes(requestedRadius)
    ? requestedRadius
    : 3000


  const supabase = createPublicServerClient()


  const { data, error } = await supabase.rpc(
    'search_hotels_near_venue',
    {
      venue_name: venue.name,
      radius_meters: radius,
    }
  )


  if (error) {
    console.error('ホテル検索に失敗:', error.message)
    throw new Error('ホテル情報を取得できませんでした。')
  }


  if (!Array.isArray(data)) {
    throw new Error(
      'ホテル検索の結果が配列ではありません。'
    )
  }


  const hotels = data as Hotel[]


  return (
    <HomeClient
      key={`venue.id-{radius}`}
      venues={venues}
      initialSelectedVenue={venue.name}
      initialHotels={hotels}
      initialRadius={radius}
      isVenuePage
    />
  )
}