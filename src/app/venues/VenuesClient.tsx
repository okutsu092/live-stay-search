type Venue = {
  id: number
  name: string
}


type VenuesProps = {
  venues: Venue[]
}


export default function VenuesContent({ venues }: VenuesProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50 text-gray-900">
      {/* Header */}
      <header className="border-b border-white/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <a href="/" className="text-xl font-extrabold tracking-tight">
            🎵 ライブ会場ホテルサーチ
          </a>


          <a
            href="/"
            className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            ホテル検索
          </a>
        </div>
      </header>


      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl" />


        <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-16 sm:pb-16 sm:pt-20">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm">
              📍 VENUE SEARCH
            </p>


            <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
              会場から、
              <br />
              <span className="text-indigo-600">
                泊まる場所を探そう。
              </span>
            </h1>


            <p className="mt-6 max-w-2xl text-base leading-8 text-gray-600 sm:text-lg">
              ライブ・イベント会場を選ぶだけ。
              <br className="sm:hidden" />
              会場周辺のホテルをかんたんに探せます。
            </p>
          </div>
        </div>
      </section>


      {/* Venue List */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8">
          <p className="text-sm font-bold text-indigo-600">
            VENUES
          </p>


          <h2 className="mt-1 text-2xl font-black sm:text-3xl">
            ライブ・イベント会場一覧
          </h2>


          <p className="mt-3 text-sm text-gray-600">
            気になる会場を選んで、周辺のホテルを探してください。
          </p>
        </div>


        {venues.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100">
            <div className="text-4xl">📍</div>


            <p className="mt-4 font-bold">
              現在、会場情報を準備しています。
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => (
              <a
                key={venue.id}
                href={`/?venue=${encodeURIComponent(venue.name)}`}
                className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-indigo-50 transition duration-300 group-hover:scale-125" />


                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                    📍
                  </div>


                  <h3 className="mt-5 text-xl font-extrabold text-gray-900">
                    {venue.name}
                  </h3>


                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    会場周辺のホテルを探す
                  </p>


                  <div className="mt-6 flex items-center font-bold text-indigo-600">
                    ホテルを見る
                    <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>


      {/* Bottom CTA */}
      <section className="border-t border-white/70 bg-white/70">
        <div className="mx-auto max-w-6xl px-6 py-14 text-center">
          <p className="text-sm font-bold text-indigo-600">
            ライブ会場ホテルサーチ
          </p>


          <h2 className="mt-2 text-2xl font-black">
            ライブの日を、もっと快適に。
          </h2>


          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-gray-600">
            会場から近いホテルを選んで、
            ライブのあとの移動もラクに。
          </p>


          <a
            href="/"
            className="mt-6 inline-flex rounded-full bg-gray-900 px-7 py-3 font-bold text-white transition hover:bg-gray-700"
          >
            ホテルを検索する →
          </a>
        </div>
      </section>


      <footer className="bg-gray-900 px-6 py-8 text-center text-sm text-gray-400">
        <p>© ライブ会場ホテルサーチ</p>
      </footer>
    </main>
  )
}