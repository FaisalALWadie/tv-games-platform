'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { io, Socket } from 'socket.io-client'
import type { FFPlayer, RoomStatePayload, GameSettings } from '../types'
import {
  FF_JOIN,
  FF_STATE,
  FF_ERROR,
  FF_JOIN_TEAM_FULL,
  FF_SETTINGS_UPDATED,
  FF_PLAYER_JOINED,
  FF_PLAYER_LEFT,
} from '@/shared/socket/events'

function JoinContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('code') ?? ''
  const name = searchParams.get('name') ?? ''

  const [players, setPlayers] = useState<FFPlayer[]>([])
  const [settings, setSettings] = useState<GameSettings | null>(null)
  const [joining, setJoining] = useState<1 | 2 | null>(null)
  const [error, setError] = useState('')
  const [teamError, setTeamError] = useState('')
  const [loading, setLoading] = useState(true)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!code || !name) {
      router.replace('/games/game2-family-feud')
      return
    }

    const socket = io()
    socketRef.current = socket

    // Just observe the room state without joining yet
    socket.on('connect', () => {
      socket.emit('FF_BOARD_JOIN', { roomCode: code })
    })

    socket.on(FF_STATE, (state: RoomStatePayload) => {
      setPlayers(state.players)
      setSettings(state.settings)
      setLoading(false)

      if (state.status !== 'waiting') {
        setError('اللعبة بدأت بالفعل')
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

    socket.on(FF_JOIN_TEAM_FULL, ({ message }: { message: string }) => {
      setTeamError(message)
      setJoining(null)
      setTimeout(() => setTeamError(''), 3500)
    })

    socket.on(FF_ERROR, ({ message }: { message: string }) => {
      setError(message)
      setLoading(false)
    })

    return () => {
      socket.disconnect()
    }
  }, [code, name, router])

  function joinTeam(teamId: 1 | 2) {
    const socket = socketRef.current
    if (!socket || joining) return
    setJoining(teamId)
    setTeamError('')

    socket.emit(FF_JOIN, { roomCode: code, playerName: name, teamId })

    // Wait for state confirming join, then navigate
    socket.once(FF_STATE, (state: RoomStatePayload) => {
      const joined = state.players.find((p) => p.name === name && p.teamId === teamId)
      if (joined) {
        router.replace(
          `/games/game2-family-feud/player-view?code=${code}&name=${encodeURIComponent(name)}&team=${teamId}`
        )
      } else {
        setJoining(null)
      }
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

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const team1Players = players.filter((p) => p.teamId === 1)
  const team2Players = players.filter((p) => p.teamId === 2)
  const t1Max = settings.team1MaxPlayers
  const t2Max = settings.team2MaxPlayers
  const t1Full = t1Max !== 999 && team1Players.length >= t1Max
  const t2Full = t2Max !== 999 && team2Players.length >= t2Max

  const maxLabel = (n: number) => (n === 999 ? '∞' : String(n))

  function renderSlots(teamPlayers: FFPlayer[], max: number, color: string) {
    const slots = max === 999 ? Math.max(6, teamPlayers.length + 1) : max
    return Array.from({ length: slots }, (_, i) => {
      const player = teamPlayers[i]
      return player ? (
        <div
          key={player.id}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 border ${color}`}
        >
          <span className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
            {player.name.charAt(0)}
          </span>
          <span className="text-white text-sm font-medium">{player.name}</span>
        </div>
      ) : (
        <div
          key={`empty-${i}`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-zinc-700 text-zinc-600 text-sm"
        >
          <span className="w-7 h-7 rounded-full border border-dashed border-zinc-700" />
          فارغ
        </div>
      )
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-5 text-white" dir="rtl">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <p className="text-zinc-500 text-sm">رمز الغرفة</p>
          <p className="text-4xl font-bold text-indigo-400 tracking-widest">{code}</p>
          <p className="text-zinc-400 mt-1">
            مرحباً <span className="text-white font-semibold">{name}</span> — اختر فريقك
          </p>
        </div>

        {/* Team error */}
        {teamError && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl px-4 py-3 mb-4 text-red-300 text-sm text-center animate-fade-up">
            ⚠️ {teamError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Team 1 */}
          <div
            className={`bg-zinc-900 border rounded-2xl p-4 flex flex-col ${
              t1Full ? 'border-red-700/50' : 'border-orange-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-orange-400 font-bold text-sm">{settings.team1Name}</h2>
              {t1Full ? (
                <span className="bg-red-800 text-red-200 text-xs px-2 py-0.5 rounded-full font-semibold">
                  ممتلئ ✓
                </span>
              ) : (
                <span className="bg-green-900 text-green-300 text-xs px-2 py-0.5 rounded-full font-semibold">
                  متاح
                </span>
              )}
            </div>
            <p className="text-zinc-500 text-xs mb-3">
              {team1Players.length} / {maxLabel(t1Max)}
            </p>
            <div className="space-y-2 flex-1 mb-4">
              {renderSlots(team1Players, t1Max, 'border-orange-500/20')}
            </div>
            <button
              onClick={() => joinTeam(1)}
              disabled={t1Full || joining !== null}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
                t1Full
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {joining === 1 ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري...
                </span>
              ) : t1Full ? (
                'ممتلئ'
              ) : (
                'انضم'
              )}
            </button>
          </div>

          {/* Team 2 */}
          <div
            className={`bg-zinc-900 border rounded-2xl p-4 flex flex-col ${
              t2Full ? 'border-red-700/50' : 'border-blue-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-blue-400 font-bold text-sm">{settings.team2Name}</h2>
              {t2Full ? (
                <span className="bg-red-800 text-red-200 text-xs px-2 py-0.5 rounded-full font-semibold">
                  ممتلئ ✓
                </span>
              ) : (
                <span className="bg-green-900 text-green-300 text-xs px-2 py-0.5 rounded-full font-semibold">
                  متاح
                </span>
              )}
            </div>
            <p className="text-zinc-500 text-xs mb-3">
              {team2Players.length} / {maxLabel(t2Max)}
            </p>
            <div className="space-y-2 flex-1 mb-4">
              {renderSlots(team2Players, t2Max, 'border-blue-500/20')}
            </div>
            <button
              onClick={() => joinTeam(2)}
              disabled={t2Full || joining !== null}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
                t2Full
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {joining === 2 ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري...
                </span>
              ) : t2Full ? (
                'ممتلئ'
              ) : (
                'انضم'
              )}
            </button>
          </div>
        </div>

        <p className="text-zinc-600 text-xs text-center">
          بمجرد انضمامك سيتم نقلك تلقائياً
        </p>
      </div>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  )
}
