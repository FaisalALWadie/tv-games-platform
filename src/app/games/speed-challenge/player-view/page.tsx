'use client'

import { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import {
  SPEED_RECONNECT, SPEED_STATE, SPEED_ERROR,
} from '@/shared/socket/events'
import type { SpeedStatePayload } from '../types'
import { PLAYER_COLOR_CLASSES } from '../types'
import { CHALLENGE_CATEGORIES } from '../challenges'

function PlayerViewContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code') ?? ''
  const name = searchParams.get('name') ?? ''

  const [state, setState] = useState<SpeedStatePayload | null>(null)
  const [error, setError] = useState('')
  const [joinName, setJoinName] = useState(name)
  const [joined, setJoined] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  const myPlayer = state?.players.find((p) => p.name === joinName) ?? null
  const myColors = myPlayer ? PLAYER_COLOR_CLASSES[myPlayer.colorIndex % PLAYER_COLOR_CLASSES.length] : null

  const emit = useCallback(
    (event: string, data: object = {}) => socketRef.current?.emit(event, { roomCode: code, ...data }),
    [code]
  )

  useEffect(() => {
    if (!code) return
    const socket = io({ reconnectionAttempts: Infinity, reconnectionDelay: 1000, reconnectionDelayMax: 5000 })
    socketRef.current = socket

    socket.on('connect', () => {
      if (joined && joinName) {
        socket.emit(SPEED_RECONNECT, { roomCode: code, playerName: joinName })
      }
    })
    socket.on(SPEED_STATE, (s: SpeedStatePayload) => setState(s))
    socket.on(SPEED_ERROR, ({ message }: { message: string }) => setError(message))

    return () => { socket.disconnect() }
  }, [code, joined, joinName])

  function handleJoin() {
    if (!joinName.trim()) return
    setJoined(true)
    emit(SPEED_RECONNECT, { playerName: joinName.trim() })
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center" dir="rtl">
        <div className="text-center px-6">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button
            onClick={() => setError('')}
            className="text-yellow-400 hover:text-yellow-300"
          >
            حاول مرة أخرى
          </button>
        </div>
      </div>
    )
  }

  // Name entry screen
  if (!joined) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6" dir="rtl">
        <p className="text-5xl mb-4">⚡</p>
        <h1 className="text-3xl font-black text-white mb-2">التحدي السريع</h1>
        <p className="text-yellow-400 text-4xl font-black tracking-widest mb-8">{code}</p>

        <div className="w-full max-w-xs">
          <input
            type="text"
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="اسمك"
            maxLength={20}
            className="w-full bg-zinc-800 border border-zinc-600 rounded-2xl px-4 py-3 text-white text-center text-xl focus:outline-none focus:border-yellow-500 mb-4"
          />
          <button
            onClick={handleJoin}
            disabled={!joinName.trim()}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-black font-bold py-4 rounded-2xl text-xl transition-colors"
          >
            انضم
          </button>
        </div>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const { phase, currentChallenge, currentRound, settings } = state
  const category = currentChallenge
    ? CHALLENGE_CATEGORIES.find((c) => c.id === currentChallenge.categoryId)
    : null

  // ── Lobby / Waiting ───────────────────────────────────────────────────────
  if (phase === 'lobby' || phase === 'countdown') {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-6 ${myColors?.phoneBg ?? 'bg-zinc-900'}`}
        dir="rtl"
      >
        <p className="text-white text-2xl font-black mb-2">{joinName}</p>
        {phase === 'lobby' ? (
          <p className="text-white text-opacity-80 text-lg">في انتظار بدء اللعبة...</p>
        ) : (
          <p className="text-white font-black text-8xl animate-pulse">{state.countdownValue}</p>
        )}
      </div>
    )
  }

  // ── Finished ──────────────────────────────────────────────────────────────
  if (phase === 'finished') {
    const sorted = [...state.players].sort((a, b) => b.score - a.score)
    const rank = sorted.findIndex((p) => p.name === joinName) + 1
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white" dir="rtl">
        <p className="text-6xl mb-3">🏁</p>
        <h1 className="text-3xl font-black text-yellow-400 mb-2">انتهت اللعبة!</h1>
        {myPlayer && (
          <p className="text-2xl font-bold mb-1">
            نقاطك: <span className={myColors?.text ?? 'text-white'}>{myPlayer.score}</span>
          </p>
        )}
        <p className="text-zinc-400 text-lg">المركز {rank}</p>
      </div>
    )
  }

  // ── Challenge / Selecting ─────────────────────────────────────────────────
  return (
    <div
      className={`min-h-screen flex flex-col p-6 ${myColors?.phoneBg ?? 'bg-zinc-900'}`}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-white font-black text-xl">{joinName}</p>
        <p className="text-white text-opacity-70 text-sm">
          {currentRound} / {settings.totalRounds}
        </p>
        {myPlayer && (
          <p className="text-white font-bold">{myPlayer.score} نقطة</p>
        )}
      </div>

      {/* Category */}
      {category && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl">{category.emoji}</span>
          <span className="text-white text-opacity-80 text-lg">{category.nameAr}</span>
        </div>
      )}

      {/* Challenge text */}
      {currentChallenge && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white font-black text-2xl text-center leading-tight">
            {currentChallenge.text}
          </p>
        </div>
      )}

      {/* Selecting phase indicator */}
      {phase === 'selecting' && (
        <div className="text-center py-6">
          <p className="text-white font-bold text-xl animate-pulse">الحكم يختار الفائز...</p>
        </div>
      )}
    </div>
  )
}

export default function SpeedChallengePlayerViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PlayerViewContent />
    </Suspense>
  )
}
