'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Venue = {
  id: number
  name: string
}

type Hotel = {
  hotel_id: number
  hotel_name: string
  address: string
  price_min: number | null
  affiliate_url: string | null
  hotel_image_url: string | null
  distance_km: number
}
function HomeContent() {
  const searchParams = useSearchParams()
  const [venues, setVenues] = useState<Venue[]>([])
  const [selectedVenue, setSelectedVenue] = useState('')
  const [radius, setRadius] = useState(3000)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadVenues() {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name')
        .order('name')

      if (error) {
        setError(error.message)
        return
      }

      setVenues(data ?? [])

if (data && data.length > 0) {
  const venueFromUrl = searchParams.get('venue')

  const matchedVenue = data.find(
    (venue) => venue.name === venueFromUrl
  )

  setSelectedVenue(
    matchedVenue ? matchedVenue.name : data[0].name
  )
}
    }

    loadVenues()
  }, [])

  async function searchHotels() {
    if (!selectedVenue) return

    setLoading(true)
    setError('')

    const { data, error } = await supabase.rpc(
      'search_hotels_near_venue',
      {
        venue_name: selectedVenue,
        radius_meters: radius,
      }
    )

    if (error) {
      setError(error.message)
      setHotels([])
    } else {
      setHotels(data ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    if (selectedVenue) {
      searchHotels()
    }
  }, [selectedVenue, radius])

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50 text-gray-900">
      {/* Header */}
      <header className="border-b border-white/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="/" className="text-xl font-extrabold tracking-tight">
            🎵 ライブ周辺ホテルサーチ
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
      {/* Hero */}
<section className="relative overflow-hidden">
  {/* Background image */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{
      backgroundImage: "url('/hero-concert.png')",
    }}
  />

  {/* Readability overlay */}
<div className="absolute inset-0 bg-white/20" />

{/* Soft gradient */}
<div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/25 to-transparent" />

  <div className="relative mx-auto max-w-6xl px-6 pb-14 pt-16 sm:pb-20 sm:pt-24">
    {/* Hero Text */}
    <div className="max-w-3xl">
      <p className="mb-4 inline-flex rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm backdrop-blur">
        🎫 LIVE EVENT × HOTEL
      </p>

      <h1 className="text-4xl font-black leading-tight tracking-tight text-gray-900 drop-shadow-sm sm:text-6xl">
        ライブの日は、
        <br />
        <span className="text-indigo-600">
          会場の近くに泊まろう。
        </span>
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
        {/* Venue */}
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-800">
            📍 会場
          </label>

          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          >
            {venues.map((venue) => (
              <option key={venue.id} value={venue.name}>
                {venue.name}
              </option>
            ))}
          </select>
        </div>

        {/* Radius */}
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-800">
            🗺️ 検索範囲
          </label>

          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-900 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
          >
            <option value={1000}>1km以内</option>
            <option value={3000}>3km以内</option>
            <option value={5000}>5km以内</option>
          </select>
        </div>
      </div>

      <button
        onClick={searchHotels}
        className="mt-6 w-full rounded-2xl bg-indigo-600 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-xl active:scale-[0.99]"
      >
        ホテルを検索する
      </button>
    </div>
  </div>
</section>

      {/* Search Results */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold text-indigo-600">
              SEARCH RESULTS
            </p>

            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              {selectedVenue}周辺のホテル
            </h2>
          </div>

          {!loading && hotels.length > 0 && (
            <p className="text-sm text-gray-500">
              {radius / 1000}km以内
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-bold">検索エラー</p>

            <pre className="mt-2 whitespace-pre-wrap text-sm">
              {error}
            </pre>
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100">
            <div className="text-3xl">🔎</div>

            <p className="mt-4 font-bold">
              ホテルを検索しています...
            </p>

            <p className="mt-2 text-sm text-gray-500">
              少々お待ちください。
            </p>
          </div>
        ) : hotels.length === 0 ? (
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
  </div>

  {hotel.hotel_image_url && (
    <img
      src={hotel.hotel_image_url}
      alt={hotel.hotel_name}
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
                      rel="noopener noreferrer"
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

      {/* Venue Link */}
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

          <a
            href="/venues"
            className="mt-6 inline-flex rounded-full bg-gray-900 px-7 py-3 font-bold text-white transition hover:bg-gray-700"
          >
            会場一覧を見る →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 px-6 py-8 text-center text-sm text-gray-400">
        <p>© ライブ周辺ホテルサーチ</p>
      </footer>
    </main>
  )
}
export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-sky-50" />}>
      <HomeContent />
    </Suspense>
  )
}