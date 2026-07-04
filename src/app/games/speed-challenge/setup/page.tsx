'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { io } from 'socket.io-client'
import { SPEED_CREATE, SPEED_ERROR } from '@/shared/socket/events'
import { DEFAULT_SPEED_SETTINGS } from '../types'
import { CHALLENGE_CATEGORIES } from '../challenges'

export default function SpeedChallengeSetupPage() {
  const router = useRouter()

  const [totalRounds, setTotalRounds] = useState(DEFAULT_SPEED_SETTINGS.totalRounds)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    DEFAULT_SPEED_SETTINGS.selectedCategories
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  function handleSubmit() {
    if (selectedCategories.length === 0) {
      setError('اختر فئة واحدة على الأقل')
      return
    }
    setLoading(true)
    setError('')

    const socket = io({ reconnectionAttempts: Infinity, reconnectionDelay: 1000, reconnectionDelayMax: 5000 })
    socket.on('connect', () => {
      socket.emit(SPEED_CREATE, { settings: { totalRounds, selectedCategories } })
    })
    socket.on('SPEED_ROOM_CREATED', ({ roomCode }: { roomCode: string }) => {
      socket.disconnect()
      router.push(`/games/speed-challenge/lobby?code=${roomCode}`)
    })
    socket.on(SPEED_ERROR, ({ message }: { message: string }) => {
      setError(message)
      setLoading(false)
      socket.disconnect()
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6" dir="rtl">
      <div className="max-w-sm mx-auto">

        <div className="text-center mb-8">
          <p className="text-5xl mb-2">⚡</p>
          <h1 className="text-3xl font-black">إعداد اللعبة</h1>
        </div>

        {/* Rounds */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 mb-5">
          <label className="block text-zinc-400 text-sm mb-3">عدد الجولات</label>
          <div className="flex gap-2 flex-wrap">
            {[5, 10, 15, 20].map((n) => (
              <button
                key={n}
                onClick={() => setTotalRounds(n)}
                className={`flex-1 py-2 rounded-xl font-bold text-lg transition-colors ${
                  totalRounds === n
                    ? 'bg-yellow-500 text-black'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 mb-6">
          <label className="block text-zinc-400 text-sm mb-3">الفئات</label>
          <div className="space-y-2">
            {CHALLENGE_CATEGORIES.map((cat) => {
              const active = selectedCategories.includes(cat.id)
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                    active
                      ? 'bg-yellow-500 text-black'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span>{cat.nameAr}</span>
                  {active && <span className="mr-auto text-sm">✓</span>}
                </button>
              )
            })}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading || selectedCategories.length === 0}
          className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-4 rounded-2xl text-xl transition-colors"
        >
          {loading ? 'جارٍ الإنشاء...' : 'إنشاء الغرفة'}
        </button>

        <a
          href="/games/speed-challenge"
          className="block text-center text-zinc-500 hover:text-zinc-300 text-sm mt-4 transition-colors"
        >
          رجوع
        </a>
      </div>
    </div>
  )
}
