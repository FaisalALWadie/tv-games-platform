'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/shared/hooks/use-auth'

const GAMES = [
  {
    id: 'game1-horouf',
    name: 'حروف',
    description: 'لعبة الحروف والكلمات',
    players: '٢ فريق',
    available: true,
  },
  {
    id: 'game2-family-feud',
    name: 'عائلة فيود',
    description: 'لعبة التنافس العائلي',
    players: '٢-٢٠',
    available: true,
  },
  {
    id: 'game3-impostor',
    name: 'من الإمبوستر؟',
    description: 'لعبة الاكتشاف الاجتماعي',
    players: '٣-١٠',
    available: true,
  },
]

export default function HubPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/auth')
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-10">
      <header className="flex items-center justify-between mb-12 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white">منصة الألعاب</h1>
        <div className="flex items-center gap-4">
          <span className="text-zinc-500 text-sm hidden sm:block">{user.email}</span>
          <button
            onClick={signOut}
            className="text-sm bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            خروج
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAMES.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </main>
    </div>
  )
}

function GameCard({ game }: { game: (typeof GAMES)[0] }) {
  return (
    <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-colors">
      <div className="aspect-video bg-zinc-800 flex items-center justify-center">
        <span className="text-5xl">{game.available ? '🎮' : '🔒'}</span>
      </div>
      <div className="p-5">
        <h2 className="text-xl font-bold text-white mb-1">{game.name}</h2>
        <p className="text-zinc-400 text-sm mb-1">{game.description}</p>
        <p className="text-zinc-600 text-xs mb-5">اللاعبون: {game.players}</p>
        {game.available ? (
          <Link
            href={`/games/${game.id}`}
            className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors"
          >
            العب الآن
          </Link>
        ) : (
          <button
            disabled
            className="w-full text-center bg-zinc-800 text-zinc-600 font-semibold py-2.5 rounded-xl cursor-not-allowed"
          >
            قريباً
          </button>
        )}
      </div>
    </div>
  )
}
