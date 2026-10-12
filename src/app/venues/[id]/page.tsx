
import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import HomeClient from '../../HomeClient'
import type { Hotel, Venue } from '../../HomeClient'
import { createPublicServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const BASE_URL = 'https://live-stay-search.vercel.app'

type VenuePageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    [key: string]: string | string[] | undefined
  }>
}

// URLのIDに対応する会場を取得
const getVenue = cache(async (id: string): Promise<Venue | null> => {
  if (!/^\d+$/.test(id)) {
    return null
  }

  const venueId = Number(id)

  if (!Number.isSafeInteger(venueId) || venueId <= 0) {
    return null
  }

  const supabase = createPublicServerClient()

  const { data, error } = await supabase
    .from('venues')
    .select('id, name, prefecture, address')
    .eq('id', venueId)
    .limit(1)
    .returns<Venue[]>()

  if (error) {
    console.error('会場情報の取得に失敗:', error.message)
    throw new Error('会場情報を取得できませんでした。')
  }

  return data?.[0] ?? null
})

// 会場ごとのタイトル・説明・canonical
export async function generateMetadata({
  params,
}: VenuePageProps): Promise<Metadata> {
  const { id } = await params
  const venue = await getVenue(id)

  if (!venue) {
    notFound()
  }

  return {
    title: {
      absolute: `${venue.name}周辺のホテル検索｜ライブ会場ホテルサーチ`,
    },
    description:
      `${venue.name}周辺のホテルを検索。` +
      '会場からの距離や楽天トラベルでの最低料金を確認して、宿泊施設を探せます。',
    alternates: {
      canonical: `${BASE_URL}/venues/${venue.id}`,
    },
  }
}

export default async function VenuePage({
  params,
  searchParams,
}: VenuePageProps) {
  const { id } = await params
  const query = await searchParams

  const venue = await getVenue(id)

  if (!venue) {
    notFound()
  }

  // 検索範囲は1km・3km・5km。未指定や不正な値は3km
  const radiusParam = Array.isArray(query.radius)
    ? query.radius[0]
    : query.radius

  const requestedRadius = Number(radiusParam)

  const initialRadius = [1000, 3000, 5000].includes(requestedRadius)
    ? requestedRadius
    : 5000

  const supabase = createPublicServerClient()

  // 選択リスト用の会場一覧
  const { data: venueData, error: venueError } = await supabase
    .from('venues')
    .select('id, name, prefecture, address')
    .order('name')
    .returns<Venue[]>()

  if (venueError) {
    console.error('会場一覧の取得に失敗:', venueError.message)
    throw new Error('会場一覧を取得できませんでした。')
  }

  // 選択した会場の周辺ホテル
  const { data: hotelData, error: hotelError } = await supabase
    .rpc('search_hotels_near_venue_with_reviews', {
      venue_name: venue.name,
      radius_meters: initialRadius,
    })

  if (hotelError) {
    console.error('ホテル検索に失敗:', hotelError.message)
    throw new Error('ホテル情報を取得できませんでした。')
  }

  if (!Array.isArray(hotelData)) {
    throw new Error('ホテル検索の結果が配列ではありません。')
  }

  const initialHotels = hotelData as Hotel[]

  const nearestHotel =
    initialHotels.length > 0
      ? [...initialHotels].sort(
          (a, b) => a.distance_km - b.distance_km
        )[0]
      : null



  // パンくずリストの構造化データ
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'トップページ',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '会場一覧',
        item: `${BASE_URL}/venues`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: venue.name,
        item: `${BASE_URL}/venues/${venue.id}`,
      },
    ],
  }

  // JSON-LD内にHTMLとして解釈される文字が入らないようにする
  const breadcrumbJsonLdString = JSON.stringify(breadcrumbJsonLd).replace(
    /</g,
    '\\u003c'
  )


  // FAQの構造化データ
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `${venue.name}から近いホテルはありますか？`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `このページでは、${venue.name}から1km・3km・5km以内のホテルを検索できます。会場に近いホテルを探したい場合は1km以内から確認し、候補が少ない場合は3km・5kmへ検索範囲を広げてください。`,
        },
      },
      {
        '@type': 'Question',
        name: 'ライブ終了後に泊まるホテルはどう選べばいいですか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '終演後は会場周辺や公共交通機関が混雑する場合があります。移動の負担を抑えたい場合は会場から近いホテルを優先し、料金を抑えたい場合は検索範囲を広げて比較するのがおすすめです。',
        },
      },
      {
        '@type': 'Question',
        name: `${venue.name}周辺で安いホテルを探すには？`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ホテルごとの最低料金を確認しながら、会場からの距離や口コミ評価・口コミ件数もあわせて比較してください。公演日や週末は料金が変動しやすいため、実際の料金は予約サイトで最新情報をご確認ください。',
        },
      },
    ],
  }

  const faqJsonLdString = JSON.stringify(faqJsonLd).replace(
    /</g,
    '\u003c'
  )

  return (
    <>
            <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: breadcrumbJsonLdString,
        }}
      />


      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: faqJsonLdString,
        }}
      />

      

      <HomeClient
        key={`${venue.id}-${initialRadius}`}
        venues={venueData ?? []}
        initialSelectedVenue={venue.name}
        initialHotels={initialHotels}
        initialRadius={initialRadius}
        isVenuePage={true}
      />

            <section className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="space-y-6">

          {/* よくある質問 */}
          <div
            id="venue-faq"
            className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"
          >
            <h2 className="text-xl font-bold text-slate-900">
              {venue.name}周辺のホテルに関するよくある質問
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <h3 className="font-bold text-slate-900">
                  {venue.name}から近いホテルはありますか？
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  このページでは、{venue.name}から1km・3km・5km以内のホテルを検索できます。
                  会場に近いホテルを探したい場合は、まず1km以内から確認し、
                  候補が少ない場合は3km・5kmへ検索範囲を広げてください。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  ライブ終了後に泊まるホテルはどう選べばいいですか？
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  終演後は会場周辺や公共交通機関が混雑する場合があります。
                  移動の負担を抑えたい場合は会場から近いホテルを優先し、
                  料金を抑えたい場合は検索範囲を広げて比較するのがおすすめです。
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  {venue.name}周辺で安いホテルを探すには？
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  ホテルごとの最低料金を確認しながら、
                  会場からの距離や口コミ評価・口コミ件数もあわせて比較してください。
                  公演日や週末は料金が変動しやすいため、
                  実際の料金は予約サイトで最新情報をご確認ください。
                </p>
              </div>

              {nearestHotel && (
                <div>
                  <h3 className="font-bold text-slate-900">
                    現在の検索結果で会場から近いホテルは？
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    現在の検索結果では、
                    <strong className="mx-1 text-slate-900">
                      {nearestHotel.hotel_name}
                    </strong>
                    が会場から約
                    <strong className="mx-1 text-slate-900">
                      {nearestHotel.distance_km}km
                    </strong>
                    の位置にあります。
                    検索範囲を変更すると表示されるホテルも変わります。
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 料金に関する注意 */}
          <div className="rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">
            <p>
              ※ 表示される宿泊料金は最低料金の目安です。
              宿泊日・人数・プラン・空室状況によって料金は変動します。
              実際の宿泊料金や空室状況は、
              各予約サイトで最新情報をご確認ください。
            </p>
          </div>

        </div>
      </section>
    </>
  )
}