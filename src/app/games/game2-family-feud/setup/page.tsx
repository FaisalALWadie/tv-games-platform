'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import type { GameSettings, RoomStatePayload } from '../types'
import { FF_CREATE_WITH_CONFIG, FF_STATE, FF_ERROR } from '@/shared/socket/events'

const MAX_OPTIONS = [
  { label: '٢', value: 2 },
  { label: '٣', value: 3 },
  { label: '٤', value: 4 },
  { label: '٥', value: 5 },
  { label: '٦', value: 6 },
  { label: 'بدون حد', value: 999 },
]
const ROUND_OPTIONS = [5, 8, 10, 12, 15]

function SetupContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const hostName = searchParams.get('name') ?? 'مضيف'

  const [settings, setSettings] = useState<GameSettings>({
    team1MaxPlayers: 4,
    team2MaxPlayers: 4,
    team1Name: 'الفريق الأول',
    team2Name: 'الفريق الثاني',
    totalRounds: 10,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  function createRoom() {
    if (!settings.team1Name.trim() || !settings.team2Name.trim()) {
      setError('أسماء الفرق مطلوبة')
      return
    }
    setLoading(true)
    setError('')

    const socket = io()
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit(FF_CREATE_WITH_CONFIG, { hostName, settings })
    })

    socket.on(FF_STATE, (state: RoomStatePayload) => {
      router.replace(
        `/games/game2-family-feud/lobby?mode=host&name=${encodeURIComponent(hostName)}&code=${state.roomCode}`
      )
    })

    socket.on(FF_ERROR, ({ message }: { message: string }) => {
      setError(message)
      setLoading(false)
    })
  }

  function update<K extends keyof GameSettings>(key: K, value: GameSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.back()}
            className="text-zinc-500 hover:text-zinc-300 text-sm mb-4 inline-flex items-center gap-1"
          >
            ← رجوع
          </button>
          <h1 className="text-3xl font-bold text-white">إعدادات اللعبة</h1>
          <p className="text-zinc-500 mt-1">عائلة فيود — {hostName}</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl px-4 py-3 mb-6 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Team 1 */}
          <div className="bg-zinc-900 border border-orange-500/30 rounded-2xl p-5">
            <h3 className="text-orange-400 font-bold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-orange-500 rounded-full" />
              الفريق الأول
            </h3>
            <div className="mb-4">
              <label className="text-zinc-400 text-xs mb-1 block">اسم الفريق</label>
              <input
                dir="rtl"
                value={settings.team1Name}
                onChange={(e) => update('team1Name', e.target.value)}
                maxLength={20}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-2 block">الحد الأقصى للاعبين</label>
              <div className="flex gap-2 flex-wrap">
                {MAX_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update('team1MaxPlayers', opt.value)}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${
                      settings.team1MaxPlayers === opt.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Team 2 */}
          <div className="bg-zinc-900 border border-blue-500/30 rounded-2xl p-5">
            <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full" />
              الفريق الثاني
            </h3>
            <div className="mb-4">
              <label className="text-zinc-400 text-xs mb-1 block">اسم الفريق</label>
              <input
                dir="rtl"
                value={settings.team2Name}
                onChange={(e) => update('team2Name', e.target.value)}
                maxLength={20}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-xs mb-2 block">الحد الأقصى للاعبين</label>
              <div className="flex gap-2 flex-wrap">
                {MAX_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => update('team2MaxPlayers', opt.value)}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${
                      settings.team2MaxPlayers === opt.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rounds */}
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5">
            <h3 className="text-zinc-300 font-bold mb-4">عدد الجولات</h3>
            <div className="flex gap-3 flex-wrap">
              {ROUND_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => update('totalRounds', n)}
                  className={`px-6 py-3 rounded-xl font-bold text-xl transition-colors ${
                    settings.totalRounds === n
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={createRoom}
          disabled={loading || !settings.team1Name.trim() || !settings.team2Name.trim()}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-4 rounded-2xl text-lg transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              جاري الإنشاء...
            </span>
          ) : (
            'أنشئ الغرفة ←'
          )}
        </button>
      </div>
    </div>
  )
}

export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SetupContent />
    </Suspense>
  )
}
