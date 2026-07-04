'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { FASTEST_CREATE, FASTEST_STATE, FASTEST_ERROR } from '@/shared/socket/events'
import type { FastestSettings, FastestStatePayload } from '../types'
import { DEFAULT_FASTEST_SETTINGS } from '../types'

const QUESTION_COUNTS = [5, 10, 15, 20]
const POINTS_OPTIONS = [5, 10, 15, 20]
const MAX_PLAYER_OPTIONS = [2, 3, 4, 5, 6, 7, 8]

export default function FastestSetupPage() {
  const router = useRouter()
  const socketRef = useRef<Socket | null>(null)
  const [settings, setSettings] = useState<FastestSettings>({ ...DEFAULT_FASTEST_SETTINGS })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return () => { socketRef.current?.disconnect() }
  }, [])

  function set<K extends keyof FastestSettings>(key: K, value: FastestSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  function createRoom() {
    setLoading(true)
    const socket = io({ reconnectionAttempts: Infinity, reconnectionDelay: 1000, reconnectionDelayMax: 5000 })
    socketRef.current = socket
    socket.on('connect', () => socket.emit(FASTEST_CREATE, { settings }))
    socket.on(FASTEST_STATE, (s: FastestStatePayload) => {
      router.push(`/games/fastest/lobby?code=${s.roomCode}`)
    })
    socket.on(FASTEST_ERROR, ({ message }: { message: string }) => {
      setError(message); setLoading(false)
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6" dir="rtl">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <p className="text-4xl mb-2">⚡</p>
          <h1 className="text-2xl font-bold">إعداد اللعبة</h1>
        </div>

        <div className="space-y-6">

          <div>
            <p className="text-zinc-400 text-sm mb-2">عدد الأسئلة</p>
            <div className="grid grid-cols-4 gap-2">
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => set('totalQuestions', n)}
                  className={`py-3 rounded-xl font-bold text-sm transition-colors ${
                    settings.totalQuestions === n
                      ? 'bg-yellow-500 text-black'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-zinc-400 text-sm mb-2">نقاط الإجابة الصحيحة</p>
            <div className="grid grid-cols-4 gap-2">
              {POINTS_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => set('pointsPerCorrect', n)}
                  className={`py-3 rounded-xl font-bold text-sm transition-colors ${
                    settings.pointsPerCorrect === n
                      ? 'bg-yellow-500 text-black'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-zinc-400 text-sm mb-2">الحد الأقصى للاعبين</p>
            <div className="grid grid-cols-4 gap-2">
              {MAX_PLAYER_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => set('maxPlayers', n)}
                  className={`py-3 rounded-xl font-bold text-sm transition-colors ${
                    settings.maxPlayers === n
                      ? 'bg-yellow-500 text-black'
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
          disabled={loading}
          className="w-full mt-8 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold py-4 rounded-2xl text-xl transition-colors"
        >
          {loading ? 'جاري الإنشاء...' : 'إنشاء الغرفة'}
        </button>

        <a href="/games/fastest" className="block text-center text-zinc-500 hover:text-zinc-300 text-sm mt-4 transition-colors">
          رجوع
        </a>
      </div>
    </div>
  )
}
