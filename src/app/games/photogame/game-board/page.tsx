'use client'

import { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import {
  PHOTO_CREATE, PHOTO_HOST_RECONNECT, PHOTO_STATE, PHOTO_ERROR,
  PHOTO_START, PHOTO_HOST_REVEAL, PHOTO_HOST_AWARD,
  PHOTO_HOST_NEXT, PHOTO_HOST_END, PHOTO_HOST_RESTART,
} from '@/shared/socket/events'
import type { PhotoStatePayload } from '../types'
import { PLAYER_COLOR_CLASSES } from '../types'
import Image from 'next/image'

function GameBoardContent() {
  const searchParams = useSearchParams()
  const codeParam = searchParams.get('code') ?? ''
  const roundsParam = searchParams.get('rounds')
  const catsParam = searchParams.get('cats')

  const [state, setState] = useState<PhotoStatePayload | null>(null)
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
        socket.emit(PHOTO_HOST_RECONNECT, { roomCode: codeParam })
      } else if (roundsParam && catsParam) {
        socket.emit(PHOTO_CREATE, {
          settings: {
            totalRounds: Number(roundsParam),
            selectedCategories: catsParam.split(','),
          },
        })
      }
    })

    socket.on(PHOTO_STATE, (s: PhotoStatePayload) => {
      roomCodeRef.current = s.roomCode
      setState(s)
      if (!codeParam && s.roomCode) {
        window.history.replaceState({}, '', `/games/photogame/game-board?code=${s.roomCode}`)
      }
    })

    socket.on(PHOTO_ERROR, ({ message }: { message: string }) => setError(message))
    return () => { socket.disconnect() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (error) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <p className="text-red-400 text-2xl mb-4">{error}</p>
        <a href="/games/photogame" className="text-indigo-400 hover:text-indigo-300">عودة</a>
      </div>
    </div>
  )

  if (!state) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const { phase, players, settings, currentRound, winner } = state

  // ── Lobby ─────────────────────────────────────────────────────────────────
  if (phase === 'lobby') {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center pb-24" dir="rtl">
        <p className="text-7xl mb-4">📸</p>
        <h1 className="text-5xl font-black mb-2">لعبة الصور</h1>
        <p className="text-zinc-400 text-xl mb-6">الرمز للانضمام:</p>
        <p className="text-indigo-400 text-8xl font-black tracking-widest mb-8">{state.roomCode}</p>
        <div className="flex flex-wrap gap-3 justify-center mb-6">
          {players.map((p) => {
            const c = PLAYER_COLOR_CLASSES[p.colorIndex % PLAYER_COLOR_CLASSES.length]
            return <div key={p.id} className={`px-4 py-2 rounded-xl border-2 ${c.border} ${c.text} font-bold`}>{p.name}</div>
          })}
        </div>
        <p className="text-zinc-500 text-lg">{players.length} / 2 لاعب</p>

        <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t-4 border-indigo-500 px-4 py-3 z-40">
          <div className="max-w-4xl mx-auto flex justify-center">
            <button
              onClick={() => emit(PHOTO_START)}
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

  // ── Finished ──────────────────────────────────────────────────────────────
  if (phase === 'finished') {
    const sorted = [...players].sort((a, b) => b.score - a.score)
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white pb-8 px-6" dir="rtl">
        <p className="text-7xl mb-4">🏆</p>
        <h1 className="text-5xl font-black text-indigo-400 mb-2">انتهت اللعبة!</h1>
        {winner && <p className="text-2xl text-zinc-300 mb-8">الفائز: <span className="text-white font-black">{winner}</span></p>}
        <div className="w-full max-w-sm space-y-3 mb-8">
          {sorted.map((p, idx) => {
            const c = PLAYER_COLOR_CLASSES[p.colorIndex % PLAYER_COLOR_CLASSES.length]
            const medal = idx === 0 ? '🥇' : '🥈'
            return (
              <div key={p.id} className={`flex items-center gap-4 bg-zinc-900 border rounded-2xl px-5 py-4 ${idx === 0 ? 'border-indigo-500' : 'border-zinc-700'}`}>
                <span className="text-2xl">{medal}</span>
                <div className={`w-4 h-4 rounded-full shrink-0 ${c.bg}`} />
                <span className="flex-1 font-bold text-lg">{p.name}</span>
                <span className={`font-black text-2xl ${c.text}`}>{p.score}</span>
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => emit(PHOTO_HOST_RESTART)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-2xl transition-colors">🔄 إعادة</button>
          <a href="/games/photogame/setup" className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold px-6 py-3 rounded-2xl transition-colors">✏️ إعداد جديد</a>
          <a href="/" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-6 py-3 rounded-2xl transition-colors">🏠 الرئيسية</a>
        </div>
      </div>
    )
  }

  // ── Playing / Reveal ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-32" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 pt-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-zinc-500 text-sm">الجولة <span className="text-white font-bold">{currentRound}</span> / {settings.totalRounds}</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📸</span>
            <span className="text-white font-bold text-lg">لعبة الصور</span>
          </div>
          <p className="text-zinc-600 text-xs font-mono">{state.roomCode}</p>
        </div>

        {/* Two player cards */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {players.map((p) => {
            const c = PLAYER_COLOR_CLASSES[p.colorIndex % PLAYER_COLOR_CLASSES.length]
            return (
              <div key={p.id} className={`bg-zinc-900 border-2 ${c.border} rounded-2xl overflow-hidden`}>
                {/* Photo area */}
                <div className="aspect-square bg-zinc-800 flex items-center justify-center relative">
                  {phase === 'reveal' && p.assignedPhoto ? (
                    <Image
                      src={p.assignedPhoto}
                      alt={p.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <p className="text-8xl select-none">?</p>
                  )}
                </div>
                {/* Player name + score */}
                <div className={`px-4 py-3 flex items-center justify-between`}>
                  <span className={`font-black text-lg ${c.text}`}>{p.name}</span>
                  <span className="text-white font-bold text-xl">{p.score} نقطة</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Host controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t-4 border-indigo-500 px-4 py-3 z-40">
        <div className="max-w-5xl mx-auto">
          {phase === 'playing' && (
            <div className="flex gap-3 justify-center">
              <button onClick={() => emit(PHOTO_HOST_REVEAL)} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-colors text-lg">
                اكشف الصور
              </button>
              <button onClick={() => emit(PHOTO_HOST_END)} className="px-6 py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-2xl transition-colors">
                🏁 إنهاء
              </button>
            </div>
          )}

          {phase === 'reveal' && (
            <div className="space-y-3">
              <p className="text-center text-zinc-400 text-sm mb-2">من اكتشف صورة الثاني؟</p>
              <div className="flex gap-3 justify-center flex-wrap">
                {players.map((p) => {
                  const c = PLAYER_COLOR_CLASSES[p.colorIndex % PLAYER_COLOR_CLASSES.length]
                  return (
                    <button
                      key={p.id}
                      onClick={() => emit(PHOTO_HOST_AWARD, { playerName: p.name })}
                      className={`px-6 py-3 rounded-2xl font-bold text-white text-lg transition-colors ${c.bg} ${c.btnHover}`}
                    >
                      {p.name} اكتشف
                    </button>
                  )
                })}
                <button
                  onClick={() => emit(PHOTO_HOST_NEXT)}
                  className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 font-bold rounded-2xl transition-colors"
                >
                  ما أحد اكتشف
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PhotoGameBoardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <GameBoardContent />
    </Suspense>
  )
}
