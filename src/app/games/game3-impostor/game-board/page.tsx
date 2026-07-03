'use client'

import { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { io, Socket } from 'socket.io-client'
import {
  IMP_HOST_RECONNECT, IMP_STATE, IMP_ERROR,
  IMP_HOST_START_VOTING, IMP_HOST_NEXT, IMP_HOST_END, IMP_HOST_RESTART,
} from '@/shared/socket/events'
import type { ImpStatePayload } from '../types'
import PlayerList from '../components/player-list'
import Timer from '../components/timer'

function GameBoardContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code') ?? ''

  const [state, setState] = useState<ImpStatePayload | null>(null)
  const [error, setError] = useState('')
  const timerFiredRef = useRef(false)

  const socketRef = useRef<Socket | null>(null)

  const emit = useCallback(
    (event: string, data: object = {}) => socketRef.current?.emit(event, { roomCode: code, ...data }),
    [code]
  )

  useEffect(() => {
    if (!code) return
    const socket = io()
    socketRef.current = socket
    socket.on('connect', () => socket.emit(IMP_HOST_RECONNECT, { roomCode: code }))
    socket.on(IMP_STATE, (s: ImpStatePayload) => {
      setState(s)
      timerFiredRef.current = false
    })
    socket.on(IMP_ERROR, ({ message }: { message: string }) => setError(message))
    return () => { socket.disconnect() }
  }, [code])

  function handleTimerExpire() {
    if (timerFiredRef.current) return
    timerFiredRef.current = true
    emit(IMP_HOST_START_VOTING)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-400 text-2xl mb-4">{error}</p>
          <Link href="/games/game3-impostor" className="text-purple-400 hover:text-purple-300">عودة</Link>
        </div>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const { phase, players, scores, voteResult, settings, currentRound, currentCategoryName } = state

  if (phase === 'lobby') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white" dir="rtl">
        <div className="text-center">
          <p className="text-zinc-400 text-2xl mb-4">في انتظار اللاعبين...</p>
          <p className="text-purple-400 text-6xl font-black tracking-widest mb-4">{code}</p>
          <p className="text-zinc-600 text-sm">{players.length} لاعب في الغرفة</p>
        </div>
      </div>
    )
  }
  const voteCounts = voteResult?.voteCounts ?? {}
  const totalVotes = Object.values(state.votes).length
  const activePlayers = players.filter((p) => !p.isEliminated)
  const endsAt = state.timerStartedAt && settings.timePerRound > 0
    ? state.timerStartedAt + settings.timePerRound * 1000
    : null

  if (phase === 'game_over') {
    const winnerAr = state.winner === 'innocents' ? 'الأبرياء' : 'الإمبوسترز'
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white" dir="rtl">
        <p className="text-7xl mb-4">{state.winner === 'innocents' ? '🕵️' : '🎭'}</p>
        <h1 className="text-5xl font-black text-purple-400 mb-2">{winnerAr}</h1>
        <p className="text-zinc-400 text-xl mb-8">فازوا باللعبة!</p>

        <div className="flex gap-16 text-center mb-8">
          <div>
            <p className="text-blue-400 font-bold text-lg">🕵️ الأبرياء</p>
            <p className="text-blue-300 text-5xl font-black">{scores.innocents}</p>
          </div>
          <div className="text-zinc-600 text-3xl self-center">vs</div>
          <div>
            <p className="text-purple-400 font-bold text-lg">🎭 الإمبوسترز</p>
            <p className="text-purple-300 text-5xl font-black">{scores.impostors}</p>
          </div>
        </div>

        {state.revealedImpostorNames.length > 0 && (
          <div className="bg-purple-900/30 border border-purple-700 rounded-2xl px-6 py-4 mb-8 text-center">
            <p className="text-purple-300 text-sm mb-2">الإمبوسترز كانوا</p>
            <p className="text-white font-bold text-xl">{state.revealedImpostorNames.join('، ')}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 items-center w-64">
          <button
            onClick={() => emit(IMP_HOST_RESTART)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors"
          >
            🔄 إعادة اللعبة
          </button>
          <Link
            href="/games/game3-impostor/setup"
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors text-center"
          >
            ✏️ إعداد جديد
          </Link>
          <Link
            href="/"
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-8 py-4 rounded-2xl text-lg transition-colors text-center"
          >
            🏠 الرئيسية
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-28" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 pt-6">

        <div className="flex items-center justify-between mb-6">
          <p className="text-zinc-500 text-sm">الجولة {currentRound} / {settings.totalRounds}</p>
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-blue-400 text-xs">🕵️ أبرياء</p>
              <p className="text-blue-300 font-black text-2xl">{scores.innocents}</p>
            </div>
            <div>
              <p className="text-purple-400 text-xs">🎭 إمبوسترز</p>
              <p className="text-purple-300 font-black text-2xl">{scores.impostors}</p>
            </div>
          </div>
          <p className="text-zinc-500 text-sm">{currentCategoryName}</p>
        </div>

        {phase === 'word_reveal' && (
          <div className="bg-purple-900/30 border-2 border-purple-600 rounded-3xl px-8 py-12 text-center mb-6">
            <p className="text-purple-300 text-3xl font-bold mb-2">🔍 اقرأ كلمتك!</p>
            <p className="text-zinc-400 text-lg">ستبدأ مرحلة النقاش خلال لحظات...</p>
          </div>
        )}

        {phase === 'discussion' && (
          <div className="text-center mb-6">
            <p className="text-zinc-400 text-xl mb-4">🗣 مرحلة النقاش</p>
            <p className="text-zinc-500 text-sm mb-6">الفئة: {currentCategoryName}</p>
            {endsAt && (
              <Timer endsAt={endsAt} onExpire={handleTimerExpire} />
            )}
            {!endsAt && (
              <p className="text-zinc-500 text-4xl font-black">∞</p>
            )}
          </div>
        )}

        {phase === 'voting' && (
          <div className="mb-6">
            <div className="text-center mb-4">
              <p className="text-yellow-400 text-2xl font-bold">🗳 مرحلة التصويت</p>
              <p className="text-zinc-400 text-sm mt-1">{totalVotes} / {activePlayers.length} صوّت</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {activePlayers.map((p) => {
                const count = Object.values(state.votes).filter((t) => t === p.name).length
                return (
                  <div
                    key={p.id}
                    className={`rounded-xl px-4 py-4 flex items-center justify-between border transition-all ${
                      count > 0
                        ? 'bg-red-900/40 border-red-600'
                        : 'bg-zinc-800 border-zinc-700'
                    }`}
                  >
                    <span className="font-bold text-lg">{p.name}</span>
                    <div className="flex items-center gap-2">
                      {p.hasVoted && <span className="text-green-400 text-xs">✓ صوّت</span>}
                      {count > 0 && (
                        <span className="bg-red-700 text-white text-sm font-black rounded-full w-7 h-7 flex items-center justify-center">
                          {count}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {phase === 'reveal' && voteResult && (
          <div className="space-y-4 mb-6">
            <div className={`rounded-3xl px-8 py-8 text-center border-2 ${
              voteResult.wasImpostor
                ? 'bg-green-900/30 border-green-500'
                : 'bg-red-900/30 border-red-500'
            }`}>
              <p className="text-4xl mb-3">{voteResult.wasImpostor ? '✅' : '❌'}</p>
              <p className="text-3xl font-black text-white mb-1">{voteResult.eliminatedName}</p>
              <p className={`text-xl font-bold ${voteResult.wasImpostor ? 'text-green-300' : 'text-red-300'}`}>
                {voteResult.wasImpostor ? '🎭 كان إمبوستر!' : '🕵️ كان بريئاً!'}
              </p>
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-zinc-400 text-sm">الكلمة السرية كانت</p>
                <p className="text-yellow-300 text-3xl font-black mt-1">{voteResult.secretWord}</p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4">
              <p className="text-zinc-400 text-sm mb-2">نتائج التصويت</p>
              <div className="space-y-1">
                {Object.entries(voteCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, count]) => (
                    <div key={name} className="flex justify-between items-center">
                      <span className="text-white">{name}</span>
                      <span className="text-zinc-400 text-sm">{count} صوت</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {(phase === 'discussion' || phase === 'word_reveal') && (
          <div className="mt-6">
            <p className="text-zinc-500 text-sm mb-2">اللاعبون</p>
            <PlayerList players={players} revealedImpostorNames={state.revealedImpostorNames} />
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t-4 border-purple-600 px-4 py-3 z-40">
        <div className="max-w-4xl mx-auto flex gap-2 flex-wrap items-center justify-center">
          {phase === 'discussion' && (
            <button
              onClick={() => emit(IMP_HOST_START_VOTING)}
              className="px-5 py-2 rounded-xl font-bold text-sm bg-yellow-600 hover:bg-yellow-700 text-white transition-colors"
            >
              🗳 انتقل للتصويت
            </button>
          )}
          {phase === 'reveal' && (
            <button
              onClick={() => emit(IMP_HOST_NEXT)}
              className="px-5 py-2 rounded-xl font-bold text-sm bg-green-600 hover:bg-green-700 text-white animate-pulse transition-colors"
            >
              ⏭ الجولة التالية
            </button>
          )}
          <button
            onClick={() => emit(IMP_HOST_END)}
            className="px-4 py-2 rounded-xl font-bold text-sm bg-red-900/60 hover:bg-red-900 text-red-300 border border-red-700/50 transition-colors"
          >
            🏁 إنهاء
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GameBoardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <GameBoardContent />
    </Suspense>
  )
}
