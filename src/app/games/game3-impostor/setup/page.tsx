'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { io, Socket } from 'socket.io-client'
import { IMP_CREATE, IMP_STATE, IMP_ERROR } from '@/shared/socket/events'
import type { ImpSettings, ImpStatePayload } from '../types'
import { DEFAULT_IMP_SETTINGS } from '../types'
import { WORD_CATEGORIES } from '../words'

const TIMER_OPTIONS: { label: string; value: number }[] = [
  { label: 'دقيقة',    value: 60  },
  { label: 'دقيقتان', value: 120 },
  { label: '٣ دقائق', value: 180 },
  { label: '٤ دقائق', value: 240 },
  { label: '٥ دقائق', value: 300 },
  { label: '∞',        value: 0   },
]

const PLAYER_COUNTS = [3, 4, 5, 6, 7, 8, 9, 10]

function maxImpostorsFor(totalPlayers: number): number {
  return Math.max(1, totalPlayers - 2)
}

export default function ImpostorSetupPage() {
  const router = useRouter()
  const socketRef = useRef<Socket | null>(null)

  const [settings, setSettings] = useState<ImpSettings>({ ...DEFAULT_IMP_SETTINGS })
  const [validationMsg, setValidationMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return () => { socketRef.current?.disconnect() }
  }, [])

  function set<K extends keyof ImpSettings>(key: K, value: ImpSettings[K]) {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }

      if (key === 'maxPlayers') {
        const cap = maxImpostorsFor(next.maxPlayers)
        if (next.numImpostors > cap) next.numImpostors = cap
      }

      const cap = maxImpostorsFor(next.maxPlayers)
      if (next.numImpostors >= next.maxPlayers - 1) {
        setValidationMsg(
          `عدد الإمبوسترز (${next.numImpostors}) كبير جداً لعدد اللاعبين (${next.maxPlayers}). ` +
          `الحد الأقصى المسموح: ${cap}`
        )
      } else {
        setValidationMsg('')
      }

      return next
    })
  }

  function createRoom() {
    if (settings.numImpostors >= settings.maxPlayers - 1) {
      setValidationMsg(
        `لا يمكن البدء: عدد الإمبوسترز (${settings.numImpostors}) يجب أن يكون ` +
        `أقل من عدد اللاعبين (${settings.maxPlayers}) بمقدار ٢ على الأقل.`
      )
      return
    }

    setLoading(true)
    const socket = io()
    socketRef.current = socket

    socket.on('connect', () => socket.emit(IMP_CREATE, { settings }))
    socket.on(IMP_STATE, (state: ImpStatePayload) => {
      router.push(`/games/game3-impostor/lobby?code=${state.roomCode}`)
    })
    socket.on(IMP_ERROR, ({ message }: { message: string }) => {
      setError(message); setLoading(false)
    })
  }

  const impostorOptions = Array.from(
    { length: maxImpostorsFor(settings.maxPlayers) },
    (_, i) => i + 1
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6" dir="rtl">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">🎭</p>
          <h1 className="text-2xl font-bold">إعداد اللعبة</h1>
        </div>

        <div className="space-y-6">

          <div>
            <p className="text-zinc-400 text-sm mb-2">الفئة</p>
            <div className="grid grid-cols-2 gap-2">
              {WORD_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => set('categoryId', cat.id)}
                  className={`py-3 px-3 rounded-xl text-sm font-bold transition-colors ${
                    settings.categoryId === cat.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {cat.nameAr}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-zinc-400 text-sm mb-2">
              عدد اللاعبين الكلي
              <span className="text-zinc-600 text-xs mr-2">(الحد الأقصى للغرفة)</span>
            </p>
            <div className="grid grid-cols-4 gap-2">
              {PLAYER_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => set('maxPlayers', n)}
                  className={`py-3 rounded-xl font-bold text-sm transition-colors ${
                    settings.maxPlayers === n
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-zinc-400 text-sm mb-2">
              عدد الإمبوسترز
              <span className="text-zinc-600 text-xs mr-2">
                (الحد الأقصى: {maxImpostorsFor(settings.maxPlayers)})
              </span>
            </p>
            <div className={`grid gap-2 ${impostorOptions.length <= 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
              {impostorOptions.map((n) => (
                <button
                  key={n}
                  onClick={() => set('numImpostors', n)}
                  className={`py-3 rounded-xl font-bold transition-colors ${
                    settings.numImpostors === n
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            {validationMsg && (
              <div className="mt-2 bg-red-900/40 border border-red-700 rounded-xl px-3 py-2">
                <p className="text-red-300 text-xs leading-relaxed">{validationMsg}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-zinc-400 text-sm mb-2">وقت النقاش</p>
            <div className="grid grid-cols-3 gap-2">
              {TIMER_OPTIONS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => set('timePerRound', value)}
                  className={`py-3 rounded-xl font-bold text-sm transition-colors ${
                    settings.timePerRound === value
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-zinc-400 text-sm mb-2">عدد الجولات</p>
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 8, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => set('totalRounds', n)}
                  className={`py-3 rounded-xl font-bold text-sm transition-colors ${
                    settings.totalRounds === n
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}

        <button
          onClick={createRoom}
          disabled={loading || !!validationMsg}
          className="w-full mt-8 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-xl transition-colors"
        >
          {loading ? 'جاري الإنشاء...' : 'إنشاء الغرفة'}
        </button>

        <Link href="/games/game3-impostor" className="block text-center text-zinc-500 hover:text-zinc-300 text-sm mt-4 transition-colors">
          رجوع
        </Link>
      </div>
    </div>
  )
}
