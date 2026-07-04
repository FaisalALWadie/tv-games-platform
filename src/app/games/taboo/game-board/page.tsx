'use client'

import { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import {
  TABOO_CREATE, TABOO_HOST_RECONNECT, TABOO_STATE, TABOO_ERROR,
  TABOO_START, TABOO_HOST_AWARD, TABOO_HOST_SKIP,
  TABOO_HOST_END_TURN, TABOO_HOST_NEXT, TABOO_HOST_END, TABOO_HOST_RESTART,
} from '@/shared/socket/events'
import type { TabooStatePayload } from '../types'
import { PLAYER_COLOR_CLASSES } from '../types'

function GameBoardContent() {
  const searchParams = useSearchParams()
  const codeParam = searchParams.get('code') ?? ''
  const roundsParam = searchParams.get('rounds')
  const diffParam = searchParams.get('diff')

  const [state, setState] = useState<TabooStatePayload | null>(null)
  const [error, setError] = useState('')
  const roomCodeRef = useRef(codeParam)
  const socketRef = useRef<Socket | null>(null)

  const emit = useCallback(
    (event: string, data: object = {}) =>
      socketRef.current?.emit(event, { roomCode: roomCodeRef.current, ...data }),
    []
  )

  useEffect(() => {
    const socket = io({ reconnectionAttempts: Infinity, reconnectionDelay: 1000, reconnectionDelayMax: 5000 })
    socketRef.current = socket

    socket.on('connect', () => {
      if (codeParam) {
        socket.emit(TABOO_HOST_RECONNECT, { roomCode: codeParam })
      } else if (roundsParam && diffParam) {
        socket.emit(TABOO_CREATE, {
          settings: { totalRounds: Number(roundsParam), difficulty: diffParam },
        })
      }
    })

    socket.on(TABOO_STATE, (s: TabooStatePayload) => {
      roomCodeRef.current = s.roomCode
      setState(s)
      if (!codeParam && s.roomCode) {
        window.history.replaceState({}, '', `/games/taboo/game-board?code=${s.roomCode}`)
      }
    })

    socket.on(TABOO_ERROR, ({ message }: { message: string }) => setError(message))
    return () => { socket.disconnect() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <p className="text-red-400 text-2xl mb-4">{error}</p>
        <a href="/games/taboo" className="text-indigo-400 hover:text-indigo-300">عودة</a>
      </div>
    </div>
  )

  if (!state) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const { phase, players, settings, currentTurnIndex, totalTurns, turnScore, winner } = state
  const clueGiver = players[currentTurnIndex % players.length]
  const currentRound = Math.floor(currentTurnIndex / players.length) + 1
  const clueGiverColors = clueGiver ? PLAYER_COLOR_CLASSES[clueGiver.colorIndex % PLAYER_COLOR_CLASSES.length] : null

  // ── Lobby ──────────────────────────────────────────────────────────────────
  if (phase === 'lobby') {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center pb-28" dir="rtl">
        <p className="text-7xl mb-4">🚫</p>
        <h1 className="text-5xl font-black mb-2">ولا كلمة</h1>
        <p className="text-zinc-400 text-xl mb-6">الرمز للانضمام:</p>
        <p className="text-indigo-400 text-8xl font-black tracking-widest mb-8">{state.roomCode}</p>

        <div className="flex flex-wrap gap-3 justify-center mb-4">
          {players.map((p) => {
            const c = PLAYER_COLOR_CLASSES[p.colorIndex % PLAYER_COLOR_CLASSES.length]
            return (
              <div key={p.id} className={`px-5 py-2 rounded-xl border-2 ${c.border} ${c.text} font-bold`}>
                {p.name}
              </div>
            )
          })}
        </div>
        <p className="text-zinc-500 text-lg mb-2">{players.length} / 8 لاعب</p>
        <p className="text-zinc-600 text-sm">
          الصعوبة: {settings.difficulty} · {settings.totalRounds} جولات للاعب
        </p>

        <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t-4 border-indigo-500 px-4 py-3 z-40">
          <div className="max-w-4xl mx-auto flex justify-center">
            <button
              onClick={() => emit(TABOO_START)}
              disabled={players.length < 2}
              className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl text-lg transition-colors"
            >
              ابدأ اللعبة
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Finished ───────────────────────────────────────────────────────────────
  if (phase === 'finished') {
    const sorted = [...players].sort((a, b) => b.score - a.score)
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white pb-8 px-6" dir="rtl">
        <p className="text-7xl mb-4">🏆</p>
        <h1 className="text-5xl font-black text-indigo-400 mb-2">انتهت اللعبة!</h1>
        {winner && (
          <p className="text-2xl text-zinc-300 mb-8">
            الفائز: <span className="text-white font-black">{winner}</span>
          </p>
        )}
        <div className="w-full max-w-sm space-y-3 mb-8">
          {sorted.map((p, idx) => {
            const c = PLAYER_COLOR_CLASSES[p.colorIndex % PLAYER_COLOR_CLASSES.length]
            const medals = ['🥇', '🥈', '🥉']
            return (
              <div key={p.id} className={`flex items-center gap-4 bg-zinc-900 border rounded-2xl px-5 py-4 ${idx === 0 ? 'border-indigo-500' : 'border-zinc-700'}`}>
                <span className="text-2xl">{medals[idx] ?? ''}</span>
                <div className={`w-4 h-4 rounded-full shrink-0 ${c.bg}`} />
                <span className="flex-1 font-bold text-lg">{p.name}</span>
                <span className={`font-black text-2xl ${c.text}`}>{p.score}</span>
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => emit(TABOO_HOST_RESTART)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-2xl transition-colors">
            🔄 إعادة
          </button>
          <a href="/games/taboo/setup" className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold px-6 py-3 rounded-2xl transition-colors">
            ✏️ إعداد جديد
          </a>
          <a href="/" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-6 py-3 rounded-2xl transition-colors">
            🏠 الرئيسية
          </a>
        </div>
      </div>
    )
  }

  // ── Playing / Turn End ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-56" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 pt-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-zinc-500 text-sm">
            جولة <span className="text-white font-bold">{currentRound}</span> / {settings.totalRounds}
            <span className="mx-2 text-zinc-700">·</span>
            دور <span className="text-white font-bold">{currentTurnIndex + 1}</span> / {totalTurns}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚫</span>
            <span className="font-bold text-lg">ولا كلمة</span>
          </div>
          <p className="text-zinc-600 text-xs font-mono">{state.roomCode}</p>
        </div>

        {/* Score dashboard */}
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {players.map((p) => {
            const c = PLAYER_COLOR_CLASSES[p.colorIndex % PLAYER_COLOR_CLASSES.length]
            const isActive = clueGiver?.id === p.id && phase === 'playing'
            return (
              <div
                key={p.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                  isActive ? `${c.border} bg-zinc-800` : 'border-zinc-700 bg-zinc-900'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${c.bg}`} />
                <span className={`font-bold ${isActive ? c.text : 'text-zinc-300'}`}>{p.name}</span>
                <span className="text-white font-black ml-1">{p.score}</span>
                {isActive && <span className="text-xs">🎤</span>}
              </div>
            )
          })}
        </div>

        {/* Turn End summary */}
        {phase === 'turn_end' && clueGiver && (
          <div className={`bg-zinc-900 border-2 ${clueGiverColors?.border ?? 'border-zinc-700'} rounded-2xl p-6 text-center`}>
            <p className="text-zinc-400 mb-1">انتهى دور</p>
            <p className={`text-3xl font-black mb-3 ${clueGiverColors?.text ?? 'text-white'}`}>{clueGiver.name}</p>
            <p className="text-zinc-300 text-xl">
              نقاط هذا الدور: <span className="text-white font-black text-3xl">{turnScore}</span>
            </p>
          </div>
        )}

        {/* Playing — current clue-giver card */}
        {phase === 'playing' && clueGiver && (
          <div className={`bg-zinc-900 border-2 ${clueGiverColors?.border ?? 'border-zinc-700'} rounded-2xl p-5 text-center`}>
            <p className="text-zinc-400 text-sm mb-1">المُلمِّح الحالي</p>
            <p className={`text-3xl font-black ${clueGiverColors?.text ?? 'text-white'}`}>
              {clueGiver.name} 🎤
            </p>
            <p className="text-zinc-500 text-sm mt-2">
              نقاط هذا الدور: <span className="text-white font-bold">{turnScore}</span>
            </p>
          </div>
        )}
      </div>

      {/* Host controls — fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t-4 border-indigo-500 px-4 py-4 z-40">
        <div className="max-w-5xl mx-auto space-y-3">

          {phase === 'playing' && (
            <>
              {/* Award buttons — one per team */}
              <div>
                <p className="text-zinc-400 text-xs text-center mb-2">من أجاب صح؟ — اضغط على الفريق الفائز بالنقطة</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {players.map((p) => {
                    const c = PLAYER_COLOR_CLASSES[p.colorIndex % PLAYER_COLOR_CLASSES.length]
                    return (
                      <button
                        key={p.id}
                        onClick={() => emit(TABOO_HOST_AWARD, { playerName: p.name })}
                        className={`px-5 py-3 rounded-2xl font-bold text-white text-base transition-all active:scale-95 ${c.bg} ${c.btnHover}`}
                      >
                        نقطة لـ {p.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Secondary controls */}
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => emit(TABOO_HOST_SKIP)}
                  className="px-5 py-2.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 font-bold rounded-2xl transition-colors text-sm"
                >
                  تخطي / خطأ ↩
                </button>
                <button
                  onClick={() => emit(TABOO_HOST_END_TURN)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-colors text-sm"
                >
                  إنهاء الدور
                </button>
                <button
                  onClick={() => emit(TABOO_HOST_END)}
                  className="px-4 py-2.5 bg-red-700 hover:bg-red-600 text-white font-bold rounded-2xl transition-colors text-sm"
                >
                  🏁 إنهاء
                </button>
              </div>
            </>
          )}

          {phase === 'turn_end' && (
            <div className="flex justify-center">
              <button
                onClick={() => emit(TABOO_HOST_NEXT)}
                className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-colors text-lg"
              >
                الدور التالي ←
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TabooGameBoardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <GameBoardContent />
    </Suspense>
  )
}
