'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { io, Socket } from 'socket.io-client'
import type { FFPlayer, RoomStatePayload, GameSettings } from '../types'
import {
  FF_HOST_RECONNECT,
  FF_STATE,
  FF_ERROR,
  FF_START,
  FF_PLAYER_JOINED,
  FF_PLAYER_LEFT,
  FF_UPDATE_SETTINGS,
  FF_SETTINGS_UPDATED,
} from '@/shared/socket/events'

const MAX_OPTIONS = [
  { label: '٢', value: 2 },
  { label: '٣', value: 3 },
  { label: '٤', value: 4 },
  { label: '٥', value: 5 },
  { label: '٦', value: 6 },
  { label: 'بدون حد', value: 999 },
]
const ROUND_OPTIONS = [5, 8, 10, 12, 15]

function LobbyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('code') ?? ''

  const [players, setPlayers] = useState<FFPlayer[]>([])
  const [settings, setSettings] = useState<GameSettings | null>(null)
  const [roomCode, setRoomCode] = useState(code)
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [editSettings, setEditSettings] = useState<GameSettings | null>(null)
  const [showStartWarning, setShowStartWarning] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!code) return

    const socket = io()
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit(FF_HOST_RECONNECT, { roomCode: code })
    })

    socket.on(FF_STATE, (state: RoomStatePayload) => {
      setRoomCode(state.roomCode)
      setPlayers(state.players)
      setSettings(state.settings)
      if (state.status !== 'waiting') {
        router.replace(`/games/game2-family-feud/game-board?code=${state.roomCode}`)
      }
    })

    socket.on(FF_PLAYER_JOINED, ({ player }: { player: FFPlayer }) => {
      setPlayers((prev) => (prev.find((p) => p.id === player.id) ? prev : [...prev, player]))
    })

    socket.on(FF_PLAYER_LEFT, ({ playerId }: { playerId: string }) => {
      setPlayers((prev) => prev.filter((p) => p.id !== playerId))
    })

    socket.on(FF_SETTINGS_UPDATED, ({ settings: s }: { settings: GameSettings }) => {
      setSettings(s)
    })

    socket.on(FF_ERROR, ({ message }: { message: string }) => {
      setError(message)
    })

    return () => {
      socket.disconnect()
    }
  }, [code, router])

  function startGame() {
    const t1 = players.filter((p) => p.teamId === 1)
    const t2 = players.filter((p) => p.teamId === 2)
    if (Math.abs(t1.length - t2.length) >= 2) {
      setShowStartWarning(true)
      return
    }
    doStart()
  }

  function doStart() {
    setShowStartWarning(false)
    socketRef.current?.emit(FF_START, { roomCode })
  }

  function openSettings() {
    if (settings) {
      setEditSettings({ ...settings })
      setShowSettings(true)
    }
  }

  function saveSettings() {
    if (!editSettings) return
    socketRef.current?.emit(FF_UPDATE_SETTINGS, { roomCode, settings: editSettings })
    setShowSettings(false)
  }

  function updateEdit<K extends keyof GameSettings>(key: K, value: GameSettings[K]) {
    setEditSettings((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const team1 = players.filter((p) => p.teamId === 1)
  const team2 = players.filter((p) => p.teamId === 2)

  const maxLabel = (n: number) => (n === 999 ? '∞' : String(n))

  function renderSlots(
    teamPlayers: FFPlayer[],
    max: number,
    color: { filled: string; empty: string }
  ) {
    const slots = max === 999 ? Math.max(4, teamPlayers.length + 1) : max
    return Array.from({ length: slots }, (_, i) => {
      const player = teamPlayers[i]
      return player ? (
        <div
          key={player.id}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl ${color.filled}`}
        >
          <span className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-200">
            {player.name.charAt(0)}
          </span>
          <span className="text-white text-sm font-medium truncate">{player.name}</span>
        </div>
      ) : (
        <div
          key={`empty-${i}`}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed ${color.empty} text-zinc-600 text-sm`}
        >
          <span className="w-6 h-6 rounded-full border border-dashed border-zinc-700" />
          فارغ
        </div>
      )
    })
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <Link href="/games/game2-family-feud" className="text-indigo-400 hover:text-indigo-300">عودة</Link>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const t1Full = settings.team1MaxPlayers !== 999 && team1.length >= settings.team1MaxPlayers
  const t2Full = settings.team2MaxPlayers !== 999 && team2.length >= settings.team2MaxPlayers

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-10 text-white" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center text-zinc-400 mb-6">غرفة الانتظار</h1>

        {/* Room code */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center mb-6">
          <p className="text-zinc-500 text-xs mb-2 uppercase tracking-widest">رمز الغرفة</p>
          <p className="text-8xl font-bold tracking-[0.2em] text-indigo-400">{roomCode}</p>
          <p className="text-zinc-600 mt-3 text-sm">
            اطلب من اللاعبين فتح الموقع والضغط على &quot;انضمام&quot; وإدخال هذا الرمز
          </p>
        </div>

        {/* Teams */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Team 1 */}
          <div className="bg-zinc-900 border border-orange-500/30 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-orange-400 font-bold text-sm truncate">{settings.team1Name}</h2>
              <span className="flex items-center gap-1 text-zinc-400 text-xs shrink-0">
                {team1.length} / {maxLabel(settings.team1MaxPlayers)}
                {t1Full && (
                  <span className="mr-1 bg-red-800 text-red-200 text-xs px-1.5 py-0.5 rounded-full">
                    ممتلئ
                  </span>
                )}
              </span>
            </div>
            <div className="space-y-2">
              {renderSlots(team1, settings.team1MaxPlayers, {
                filled: 'bg-orange-500/10 border border-orange-500/20',
                empty: 'border-zinc-700',
              })}
            </div>
          </div>

          {/* Team 2 */}
          <div className="bg-zinc-900 border border-blue-500/30 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-blue-400 font-bold text-sm truncate">{settings.team2Name}</h2>
              <span className="flex items-center gap-1 text-zinc-400 text-xs shrink-0">
                {team2.length} / {maxLabel(settings.team2MaxPlayers)}
                {t2Full && (
                  <span className="mr-1 bg-red-800 text-red-200 text-xs px-1.5 py-0.5 rounded-full">
                    ممتلئ
                  </span>
                )}
              </span>
            </div>
            <div className="space-y-2">
              {renderSlots(team2, settings.team2MaxPlayers, {
                filled: 'bg-blue-500/10 border border-blue-500/20',
                empty: 'border-zinc-700',
              })}
            </div>
          </div>
        </div>

        {/* Game info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 mb-6 flex items-center justify-between text-sm">
          <span className="text-zinc-500">الجولات</span>
          <span className="text-white font-semibold">{settings.totalRounds}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={openSettings}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-4 rounded-2xl transition-colors text-sm"
          >
            تعديل الإعدادات
          </button>
          <button
            onClick={startGame}
            disabled={players.length < 2}
            className="flex-[2] bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-4 rounded-2xl text-lg transition-colors"
          >
            {players.length < 2 ? 'في انتظار لاعبَين على الأقل' : 'ابدأ اللعبة'}
          </button>
        </div>
      </div>

      {/* Settings modal */}
      {showSettings && editSettings && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">تعديل الإعدادات</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-zinc-500 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-5">
              {/* Team 1 name */}
              <div>
                <label className="text-zinc-400 text-xs mb-1 block">اسم الفريق الأول</label>
                <input
                  dir="rtl"
                  value={editSettings.team1Name}
                  onChange={(e) => updateEdit('team1Name', e.target.value)}
                  maxLength={20}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Team 1 max */}
              <div>
                <label className="text-zinc-400 text-xs mb-2 block">حد لاعبي الفريق الأول</label>
                <div className="flex gap-2 flex-wrap">
                  {MAX_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateEdit('team1MaxPlayers', opt.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        editSettings.team1MaxPlayers === opt.value
                          ? 'bg-orange-500 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team 2 name */}
              <div>
                <label className="text-zinc-400 text-xs mb-1 block">اسم الفريق الثاني</label>
                <input
                  dir="rtl"
                  value={editSettings.team2Name}
                  onChange={(e) => updateEdit('team2Name', e.target.value)}
                  maxLength={20}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Team 2 max */}
              <div>
                <label className="text-zinc-400 text-xs mb-2 block">حد لاعبي الفريق الثاني</label>
                <div className="flex gap-2 flex-wrap">
                  {MAX_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateEdit('team2MaxPlayers', opt.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        editSettings.team2MaxPlayers === opt.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rounds */}
              <div>
                <label className="text-zinc-400 text-xs mb-2 block">عدد الجولات</label>
                <div className="flex gap-2 flex-wrap">
                  {ROUND_OPTIONS.map((n) => (
                    <button
                      key={n}
                      onClick={() => updateEdit('totalRounds', n)}
                      className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                        editSettings.totalRounds === n
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

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3 rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={saveSettings}
                disabled={!editSettings.team1Name.trim() || !editSettings.team2Name.trim()}
                className="flex-[2] bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unbalanced teams warning */}
      {showStartWarning && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-zinc-900 border border-yellow-700 rounded-2xl p-6 w-full max-w-sm text-center">
            <p className="text-yellow-400 text-4xl mb-3">⚠️</p>
            <h2 className="text-white font-bold text-lg mb-2">الفرق غير متوازنة</h2>
            <p className="text-zinc-400 text-sm mb-5">
              {settings.team1Name} فيه {team1.length}{' '}
              {team1.length === 1 ? 'لاعب' : 'لاعبين'} والفريق{' '}
              {settings.team2Name} فيه {team2.length}{' '}
              {team2.length === 1 ? 'لاعب' : 'لاعبين'}. متأكد من البدء؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStartWarning(false)}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3 rounded-xl transition-colors"
              >
                لا، تراجع
              </button>
              <button
                onClick={doStart}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                نعم، ابدأ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function LobbyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LobbyContent />
    </Suspense>
  )
}
