import { groupVenuesByPrefecture } from '../../lib/group-venues'

type Venue = {
  id: number
  name: string
  prefecture: string | null
  address: string | null
}

type VenuesProps = {
  venues: Venue[]
}

export default function VenuesContent({ venues }: VenuesProps) {
  const venueGroups = groupVenuesByPrefecture(venues)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/70 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <a
            href="/"
            className="min-w-0 shrink text-base font-extrabold tracking-tight sm:text-xl"
          >
            <span className="sm:hidden">🎵 ライブ会場ホテル</span>
            <span className="hidden sm:inline">🎵 ライブ会場ホテルサーチ</span>
          </a>

          {/* Desktop navigation */}
          <nav
            aria-label="メインナビゲーション"
            className="hidden items-center justify-end gap-2 md:flex"
          >
            <a
              href="/#hotel-search"
              className="inline-flex min-w-[180px] items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-lg"
            >
              🔎 ホテル検索
            </a>

            <a
              href="/venues" aria-current="page"
              className="rounded-full bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700"
            >
              ライブ・イベント会場一覧
            </a>

            <a
              href="/faq"
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              よくある質問
            </a>
          </nav>

          {/* Mobile navigation */}
          <div className="flex shrink-0 items-center gap-2 md:hidden">
            <a
              href="/#hotel-search"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-indigo-600 px-3 py-2 text-xs font-extrabold text-white shadow-sm"
            >
              🔎 ホテル検索
            </a>

            <details className="relative">
              <summary
                aria-label="メニューを開く"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-700 shadow-sm"
              >
                ☰
              </summary>

              <div className="absolute right-0 top-12 z-[60] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <a
                  href="/venues"
                  className="block rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  ライブ・イベント会場一覧
                </a>

                <a
                  href="/faq"
                  className="block rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  よくある質問
                </a>
              </div>
            </details>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav
        aria-label="パンくずリスト"
        className="border-b border-slate-100 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <li>
              <a
                href="/"
                className="transition hover:text-indigo-600"
              >
                トップページ
              </a>
            </li>

            <li aria-hidden="true">/</li>

            <li
              aria-current="page"
              className="font-medium text-slate-800"
            >
              ライブ・イベント会場一覧
            </li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage: "url('/hero-concert.png')",
          }}
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/25" />

        <div className="mx-auto max-w-7xl px-4 pb-12 pt-9 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur">
              <span aria-hidden="true">📍</span>
              VENUE SEARCH
            </p>

            <h1 className="mt-4 text-3xl font-black leading-[1.15] tracking-tight text-white sm:mt-5 sm:text-5xl lg:text-6xl">
              ライブ・イベント
              <br />
              <span className="text-sky-300">
                会場一覧
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-100 sm:text-lg">
              ライブ・コンサート・イベント会場を選んで、
              <br className="hidden sm:block" />
              会場周辺のホテルを距離・料金・口コミから探せます。
            </p>
          </div>
        </div>
      </section>

      {/* Venue List */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-bold tracking-widest text-blue-700">
            VENUES
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            ライブ・イベント会場一覧
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            気になる会場を選んで、周辺のホテルを探してください。
          </p>
        </div>

        {venues.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="text-4xl" aria-hidden="true">
              📍
            </div>

            <p className="mt-4 font-bold">
              現在、会場情報を準備しています。
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {venueGroups.map((group) => (
              <section key={group.prefecture}>
                <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-slate-200 pb-3">
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    {group.prefecture}
                  </h3>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                    {group.venues.length}会場
                  </span>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.venues.map((venue) => (
                    <a
                      key={venue.id}
                      href={`/venues/${venue.id}`}
                      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                    >
                      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-50 transition duration-300 group-hover:scale-125" />

                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                          📍
                        </div>

                        <h4 className="mt-5 text-xl font-extrabold leading-8 text-slate-900">
                          {venue.name}
                        </h4>

                        <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
                          {venue.address?.trim() || '住所未登録'}
                        </p>

                        <div className="mt-6 flex items-center font-bold text-blue-700">
                          周辺のホテルを見る
                          <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                            →
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-bold tracking-widest text-blue-700">
            LIVE STAY SEARCH
          </p>

          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            ライブの日を、もっと快適に。
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
            会場から近いホテルを選んで、
            ライブ後の移動もスムーズに。
          </p>

          <a
            href="/#hotel-search"
            className="mt-6 inline-flex min-w-[200px] items-center justify-center rounded-full bg-blue-700 px-7 py-3 font-bold text-white shadow-sm transition hover:bg-blue-800 hover:shadow-md"
          >
            🔎 ホテルを検索する
          </a>
        </div>
      </section>

      <footer className="bg-slate-950 px-6 py-8 text-center text-sm text-slate-400">
        <a
          href="/"
          className="font-bold text-white transition hover:text-sky-300"
        >
          ライブ会場ホテルサーチ
        </a>

        <p className="mt-3">
          © ライブ会場ホテルサーチ
        </p>
      </footer>
    </main>
  )
}