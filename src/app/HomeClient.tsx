'use client'


import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { groupVenuesByPrefecture } from '@/lib/group-venues'


export type Venue = {
  id: number
  name: string
  prefecture: string | null
  address: string | null
}


export type Hotel = {
  hotel_id: number
  hotel_name: string
  address: string
  price_min: number | null
  affiliate_url: string | null
  hotel_image_url: string | null
  distance_km: number
  review_average: number | null
  review_count: number | null
  review_updated_at: string | null
}


type HomeClientProps = {
  venues: Venue[]
  initialSelectedVenue: string
  initialHotels: Hotel[]
  initialRadius: number
  isVenuePage?: boolean
}




export default function HomeClient({
  venues,
  initialSelectedVenue,
  initialHotels,
  initialRadius,
  isVenuePage = false,
}: HomeClientProps) {
  const router = useRouter()
  const [loading, startTransition] = useTransition()


  const [selectedVenue, setSelectedVenue] = useState(
  isVenuePage ? initialSelectedVenue : ''
)
  const [resultsVenue, setResultsVenue] = useState(initialSelectedVenue)
  const [radius, setRadius] = useState(initialRadius)
  const [error, setError] = useState('')


  const hotels = initialHotels
  const venueGroups = groupVenuesByPrefecture(venues)



function searchHotels() {
  const venue = venues.find(
    (item) => item.name === selectedVenue
  )

  if (!venue || loading) {
    return
  }

  if (!venue || loading) {
    return
  }

  const destination =
    radius === 3000
      ? `/venues/${venue.id}`
      : `/venues/${venue.id}?radius=${radius}`

  const currentUrl =
    window.location.pathname + window.location.search

  if (currentUrl === destination) {
    return
  }

  startTransition(() => {
    router.push(destination)
  })
}




  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50 text-gray-900">
      {/* Header */}
      <header className="border-b border-white/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="/" className="text-xl font-extrabold tracking-tight">
            🎵 ライブ会場ホテルサーチ
          </a>


          <a
            href="/venues"
            className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            会場一覧
          </a>
        </div>
      </header>


      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/hero-concert.png')",
          }}
        />


        <div className="absolute inset-0 bg-white/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/25 to-transparent" />


        <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-16 sm:pb-20 sm:pt-24">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm backdrop-blur">
              🎫 ライブ会場ホテルサーチ
            </p>


            <h1 className="text-4xl font-black leading-tight tracking-tight text-gray-900 drop-shadow-sm sm:text-6xl">
  {isVenuePage ? (
    <>
      {initialSelectedVenue}周辺の
      <br />
      <span className="text-indigo-600">
        ホテルを探す
      </span>
    </>
  ) : (
    <>
      ライブの日は、
      <br />
      <span className="text-indigo-600">
        会場の近くに泊まろう。
      </span>
    </>
  )}
</h1>





            <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-gray-700 sm:text-lg">
              ライブ・イベント会場を選んで、
              <br className="sm:hidden" />
              会場から近いホテルをかんたんに探せます。
            </p>
          </div>


          {/* Search Box */}
          <div className="relative mt-10 max-w-3xl rounded-3xl bg-white/95 p-6 shadow-2xl ring-1 ring-white/80 backdrop-blur sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-gray-900">
                会場からホテルを探す
              </h2>


              <p className="mt-1 text-sm text-gray-500">
                会場と検索範囲を選んでください。
              </p>
            </div>


            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="venue"
                  className="mb-2 block text-sm font-bold text-gray-800"
                >
                  📍 会場
                </label>


                <select
  id="venue"
  value={selectedVenue}
  onChange={(event) => setSelectedVenue(event.target.value)}
  disabled={venues.length === 0}
  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
>
<option value="">会場を選択してください</option>

  {venues.length === 0 && (
    <option value="">
      登録されている会場がありません
    </option>
  )}

  {venueGroups.map((group) => (
  <optgroup
    key={group.prefecture}
    label={group.prefecture}
  >
    {group.venues.map((venue) => (
      <option key={venue.id} value={venue.name}>
        {venue.name}
      </option>
    ))}
  </optgroup>
))}

</select>

              </div>


              <div>
                <label
                  htmlFor="radius"
                  className="mb-2 block text-sm font-bold text-gray-800"
                >
                  🗺️ 検索範囲
                </label>


                <select
  id="radius"
  value={radius}
  onChange={(event) => setRadius(Number(event.target.value))}
  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
>
  <option value={1000}>1km以内</option>
  <option value={3000}>3km以内</option>
  <option value={5000}>5km以内</option>
</select>

              </div>
            </div>


            <button
  type="button"
  onClick={searchHotels}
  disabled={loading || !selectedVenue}
  className="mt-6 w-full rounded-2xl bg-indigo-600 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
>
  {loading ? '検索しています…' : 'ホテルを検索する'}
</button>

          </div>
        </div>
      </section>


      {/* Search Results */}
{isVenuePage && (
  <section
    className="mx-auto max-w-6xl px-6 pb-20"
    aria-busy={loading}
  >
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold text-indigo-600">
  会場から探す
</p>


            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
 {(isVenuePage ? initialSelectedVenue : resultsVenue)
  ? `${isVenuePage ? initialSelectedVenue : resultsVenue}周辺のホテル`
  : '会場周辺のホテル'}
</h2>
          </div>


          {!loading && !error && hotels.length > 0 && (
            <p className="text-sm text-gray-500">
              {radius / 1000}km以内
            </p>
          )}
        </div>


        {error ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700"
          >
            <p className="font-bold">検索エラー</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        ) : loading ? (
          <div
            role="status"
            className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100"
          >
            <div className="text-3xl">🔎</div>
            <p className="mt-4 font-bold">
              ホテルを検索しています…
            </p>
            <p className="mt-2 text-sm text-gray-500">
              少々お待ちください。
            </p>
          </div>
        ) : !selectedVenue ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100">
            <p className="font-bold">
              現在、会場情報を準備しています。
            </p>
          </div>
       ) : !loading && hotels.length === 0 ? (
  <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100">
    <div className="text-4xl">🏨</div>
    <p className="mt-4 font-bold">
      条件に合うホテルが見つかりませんでした。
    </p>
    <p className="mt-2 text-sm text-gray-500">
      検索範囲を広げて、もう一度お試しください。
    </p>
  </div>
) : (
          <div className="grid gap-5 md:grid-cols-2">
            {hotels.map((hotel) => (
              <article
                key={hotel.hotel_id}
                className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold tracking-wider text-indigo-600">
                      HOTEL
                    </p>


                    <h3 className="mt-2 text-xl font-extrabold text-gray-900">
                      {hotel.hotel_name}
                    </h3>
<div className="mt-3">
  <p className="text-xs font-medium text-gray-500">
    楽天トラベルでの最低料金（目安）
  </p>

  {hotel.price_min != null && hotel.price_min > 0 ? (
    <p className="mt-1 text-xl font-extrabold text-indigo-600">
      {hotel.price_min.toLocaleString('ja-JP')}
      <span className="ml-1 text-sm font-bold">円〜</span>
    </p>
  ) : (
    <p className="mt-1 text-sm text-gray-500">
      料金情報なし
    </p>
  )}
</div>

{/* 口コミ評価 */}
<div className="mt-4">
  {hotel.review_average != null ? (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div
          className="flex items-center text-xl leading-none"
          aria-label={`5点満点中 ${hotel.review_average}点`}
        >
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={index}
              className={
                index < Math.round(hotel.review_average!)
                  ? 'text-amber-400'
                  : 'text-gray-300'
              }
            >
              ★
            </span>
          ))}
        </div>

        <span className="font-bold text-gray-900">
          {hotel.review_average.toFixed(1)}
        </span>

        {hotel.review_count != null && (
          <span className="text-sm text-gray-500">
            （口コミ {hotel.review_count.toLocaleString('ja-JP')}件）
          </span>
        )}
      </div>

      {hotel.review_updated_at && (
        <p className="mt-1 text-xs text-gray-400">
          口コミ更新日：
          {hotel.review_updated_at.replace(/-/g, '/')}
        </p>
      )}
    </>
  ) : (
    <p className="text-sm text-gray-500">口コミ情報なし</p>
  )}
</div>



                    
                  </div>


                  {hotel.hotel_image_url && (
                    <img
                      src={hotel.hotel_image_url}
                      alt={hotel.hotel_name}
                      loading="lazy"
                      width={128}
                      height={96}
                      className="h-24 w-32 shrink-0 rounded-2xl object-cover"
                    />
                  )}
                </div>


                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {hotel.address}
                </p>


                <div className="mt-5 border-t border-gray-100 pt-5">
                  <p className="text-sm font-semibold text-gray-700">
                    📍 {selectedVenue}から約 {hotel.distance_km} km
                  </p>


                  {hotel.affiliate_url ? (
                    <a
                      href={hotel.affiliate_url}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      className="mt-5 block rounded-2xl bg-indigo-600 px-5 py-3 text-center font-bold text-white transition hover:bg-indigo-700"
                    >
                      予約・詳細を見る →
                    </a>
                  ) : (
                    <div className="mt-5 rounded-2xl bg-gray-100 px-5 py-3 text-center text-sm font-semibold text-gray-500">
                      予約情報準備中
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
)}


      {/* Venue Links */}
      <section className="border-t border-white/70 bg-white/70">
        <div className="mx-auto max-w-6xl px-6 py-14 text-center">
          <p className="text-sm font-bold text-indigo-600">
            FIND YOUR VENUE
          </p>


          <h2 className="mt-2 text-2xl font-black">
            会場から探す
          </h2>


          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-gray-600">
            ライブ・イベント会場の一覧から、
            周辺ホテルを探すこともできます。
          </p>


          <ul className="mt-6 grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => (
              <li key={venue.id}>
                <a
                  href={`/venues/${venue.id}`}
                  className="block rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
                >
                  {venue.name}周辺のホテル
                </a>
              </li>
            ))}
          </ul>


          <a
            href="/venues"
            className="mt-6 inline-flex rounded-full bg-gray-900 px-7 py-3 font-bold text-white transition hover:bg-gray-700"
          >
            会場一覧を見る →
          </a>
        </div>
      </section>


      <footer className="bg-gray-900 px-6 py-8 text-center text-sm text-gray-400">
        <p>© ライブ会場ホテルサーチ</p>
      </footer>
    </main>
  )
}