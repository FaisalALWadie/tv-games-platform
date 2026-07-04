'use client'

import { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import {
  SPEED_HOST_RECONNECT, SPEED_STATE, SPEED_ERROR,
  SPEED_START, SPEED_HOST_AWARD, SPEED_HOST_NEXT,
  SPEED_HOST_END, SPEED_HOST_RESTART,
} from '@/shared/socket/events'
import type { SpeedStatePayload, SpeedPhase } from '../types'
import { PLAYER_COLOR_CLASSES } from '../types'
import ChallengeDisplay from '../components/ChallengeDisplay'
import CountdownTimer from '../components/CountdownTimer'
import WinnerButtons from '../components/WinnerButtons'
import ScoreBoard from '../components/ScoreBoard'
import sounds from '@/lib/sounds'

function GameBoardContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code') ?? ''

  const [state, setState] = useState<SpeedStatePayload | null>(null)
  const [error, setError] = useState('')
  const socketRef = useRef<Socket | null>(null)
  const prevPhaseRef = useRef<SpeedPhase | null>(null)
  const prevCountdownRef = useRef<number | null>(null)

  const emit = useCallback(
    (event: string, data: object = {}) => socketRef.current?.emit(event, { roomCode: code, ...data }),
    [code]
  )

  useEffect(() => {
    if (!code) return
    const socket = io({ reconnectionAttempts: Infinity, reconnectionDelay: 1000, reconnectionDelayMax: 5000 })
    socketRef.current = socket
    socket.on('connect', () => socket.emit(SPEED_HOST_RECONNECT, { roomCode: code }))
    socket.on(SPEED_STATE, (s: SpeedStatePayload) => {
      setState((prev) => {
        const prevPhase = prev?.phase ?? null
        const prevCountdown = prev?.countdownValue ?? null

        // Countdown ticks
        if (s.phase === 'countdown' && s.countdownValue !== null) {
          if (s.countdownValue !== prevCountdown) {
            if (s.countdownValue === 1) sounds.countdownFinal()
            else sounds.countdownTick()
          }
        }

        // Challenge just appeared
        if (s.phase === 'challenge' && prevPhase === 'countdown') {
          sounds.challengeStart()
        }

        // Winner selected (selecting → challenge means next round started)
        if (s.phase === 'countdown' && prevPhase === 'selecting') {
          sounds.winner()
        }

        // Game finished
        if (s.phase === 'finished' && prevPhase !== 'finished') {
          sounds.gameOver()
        }

        prevPhaseRef.current = s.phase
        prevCountdownRef.current = s.countdownValue
        return s
      })
    })
    socket.on(SPEED_ERROR, ({ message }: { message: string }) => setError(message))
    return () => { socket.disconnect() }
  }, [code])

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-400 text-2xl mb-4">{error}</p>
          <a href="/games/speed-challenge" className="text-yellow-400 hover:text-yellow-300">عودة</a>
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

  const { phase, players, settings, currentRound, countdownValue, currentChallenge, lastWinnerName, winner } = state

  // ── Lobby ─────────────────────────────────────────────────────────────────
  if (phase === 'lobby') {
    return (
      <div className="min-h-screen bg-zinc-950 text-white pb-24" dir="rtl">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-7xl mb-4">⚡</p>
          <h1 className="text-5xl font-black mb-2">لعبة التحدي السريع</h1>
          <p className="text-zinc-400 text-xl mb-6">الرمز للانضمام:</p>
          <p className="text-yellow-400 text-8xl font-black tracking-widest mb-8">{code}</p>

          {players.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center mb-6 max-w-lg">
              {players.map((p) => {
                const colors = PLAYER_COLOR_CLASSES[p.colorIndex % PLAYER_COLOR_CLASSES.length]
                return (
                  <div key={p.id} className={`px-4 py-2 rounded-xl border-2 ${colors.border} ${colors.text} font-bold`}>
                    {p.name}
                  </div>
                )
              })}
            </div>
          )}

          <p className="text-zinc-500 text-lg">{players.length} / 8 لاعب</p>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t-4 border-yellow-500 px-4 py-3 z-40">
          <div className="max-w-4xl mx-auto flex justify-center">
            <button
              onClick={() => emit(SPEED_START)}
              disabled={players.length < 1}
              className="px-10 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold rounded-2xl text-lg transition-colors"
            >
              ابدأ اللعبة
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Finished ──────────────────────────────────────────────────────────────
  if (phase === 'finished') {
    const sorted = [...players].sort((a, b) => b.score - a.score)
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white pb-8 px-6" dir="rtl">
        <p className="text-7xl mb-4">🏆</p>
        <h1 className="text-5xl font-black text-yellow-400 mb-2">انتهت اللعبة!</h1>
        {winner && (
          <p className="text-2xl text-zinc-300 mb-8">
            الفائز: <span className="text-white font-black">{winner}</span>
          </p>
        )}

        <div className="w-full max-w-sm space-y-3 mb-8">
          {sorted.map((p, idx) => {
            const colors = PLAYER_COLOR_CLASSES[p.colorIndex % PLAYER_COLOR_CLASSES.length]
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`
            return (
              <div
                key={p.id}
                className={`flex items-center gap-4 bg-zinc-900 border rounded-2xl px-5 py-4 ${
                  idx === 0 ? 'border-yellow-500' : 'border-zinc-700'
                }`}
              >
                <span className="text-2xl">{medal}</span>
                <div className={`w-4 h-4 rounded-full shrink-0 ${colors.bg}`} />
                <span className="flex-1 font-bold text-lg">{p.name}</span>
                <span className={`font-black text-2xl ${colors.text}`}>{p.score}</span>
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => emit(SPEED_HOST_RESTART)}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-2xl transition-colors"
          >
            🔄 إعادة اللعبة
          </button>
          <a
            href="/games/speed-challenge/setup"
            className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold px-6 py-3 rounded-2xl transition-colors"
          >
            ✏️ إعداد جديد
          </a>
          <a
            href="/"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-6 py-3 rounded-2xl transition-colors"
          >
            🏠 الرئيسية
          </a>
        </div>
      </div>
    )
  }

  // ── Countdown ─────────────────────────────────────────────────────────────
  if (phase === 'countdown' && countdownValue !== null) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center" dir="rtl">
        <CountdownTimer value={countdownValue} />
      </div>
    )
  }

  // ── Challenge / Selecting ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-52" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 pt-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-zinc-500 text-sm">
            الجولة <span className="text-white font-bold">{currentRound}</span> / {settings.totalRounds}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-black text-2xl">⚡</span>
            <span className="text-white font-bold text-lg">التحدي السريع</span>
          </div>
          <p className="text-zinc-600 text-xs font-mono">{code}</p>
        </div>

        {/* Last winner banner */}
        {lastWinnerName && phase === 'challenge' && (
          <div className="mb-6 text-center">
            <p className="text-green-400 text-lg font-bold animate-pulse">
              🎉 الجولة السابقة: {lastWinnerName}
            </p>
          </div>
        )}

        {/* Challenge text */}
        {currentChallenge && (
          <div className="py-12">
            <ChallengeDisplay challenge={currentChallenge} />
          </div>
        )}

        {/* Scoreboard */}
        <div className="mt-6">
          <ScoreBoard
            players={players}
            currentRound={currentRound}
            totalRounds={settings.totalRounds}
          />
        </div>
      </div>

      {/* Selecting phase: host picks winner */}
      {phase === 'selecting' && (
        <WinnerButtons
          players={players}
          onAward={(playerName) => emit(SPEED_HOST_AWARD, { playerName })}
          onSkip={() => { sounds.skip(); emit(SPEED_HOST_NEXT) }}
        />
      )}

      {/* Challenge phase: host can open selection or skip */}
      {phase === 'challenge' && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t-4 border-yellow-500 px-4 py-3 z-40">
          <div className="max-w-4xl mx-auto flex gap-3 justify-center">
            <button
              onClick={() => { sounds.skip(); emit(SPEED_HOST_NEXT) }}
              className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-2xl transition-colors"
            >
              ⏭ تخطّي
            </button>
            <button
              onClick={() => emit(SPEED_HOST_AWARD, { playerName: '__select' })}
              className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-2xl transition-colors"
            >
              🏆 اختار الفائز
            </button>
            <button
              onClick={() => emit(SPEED_HOST_END)}
              className="px-6 py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-2xl transition-colors"
            >
              🏁 إنهاء
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SpeedChallengeGameBoardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <GameBoardContent />
    </Suspense>
  )
}
