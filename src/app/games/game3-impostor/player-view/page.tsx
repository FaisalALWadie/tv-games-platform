'use client'

import { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { io, Socket } from 'socket.io-client'
import {
  IMP_RECONNECT, IMP_STATE, IMP_ERROR, IMP_WORD, IMP_VOTE,
} from '@/shared/socket/events'
import type { ImpStatePayload, ImpWordPayload } from '../types'

function PlayerViewContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code') ?? ''
  const name = searchParams.get('name') ?? ''

  const [state, setState] = useState<ImpStatePayload | null>(null)
  const [myWord, setMyWord] = useState<ImpWordPayload | null>(null)
  const [voted, setVoted] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [isReconnecting, setIsReconnecting] = useState(false)

  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!code || !name) return
    const socket = io({ reconnection: true, reconnectionDelay: 1000, reconnectionAttempts: 10 })
    socketRef.current = socket

    socket.on('connect', () => {
      setIsReconnecting(false)
      socket.emit(IMP_RECONNECT, { roomCode: code, playerName: name })
    })
    socket.on('disconnect', () => setIsReconnecting(true))
    socket.on(IMP_STATE, (s: ImpStatePayload) => {
      setState(s)
      if (s.phase === 'word_reveal') { setVoted(null); setMyWord(null) }
    })
    socket.on(IMP_WORD, (w: ImpWordPayload) => setMyWord(w))
    socket.on(IMP_ERROR, ({ message }: { message: string }) => setError(message))

    return () => { socket.disconnect() }
  }, [code, name])

  const submitVote = useCallback((targetName: string) => {
    if (voted) return
    setVoted(targetName)
    socketRef.current?.emit(IMP_VOTE, { roomCode: code, targetName })
  }, [code, voted])

  if (isReconnecting) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-semibold">جاري إعادة الاتصال...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
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

  const { phase, players, scores, voteResult, settings } = state
  const me = players.find((p) => p.name === name)
  const activePlayers = players.filter((p) => !p.isEliminated && p.name !== name)

  if (phase === 'lobby') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-6" dir="rtl">
        <p className="text-5xl mb-4">🎭</p>
        <p className="text-2xl font-bold mb-1">{name}</p>
        <p className="text-zinc-400 mb-8">في انتظار بدء اللعبة...</p>
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (phase === 'game_over') {
    const winnerAr = state.winner === 'innocents' ? 'الأبرياء' : 'الإمبوسترز'
    const iWon = (state.winner === 'innocents' && !myWord?.isImpostor) ||
                 (state.winner === 'impostors' && myWord?.isImpostor)
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-6" dir="rtl">
        <p className="text-6xl mb-3">{iWon ? '🏆' : '😔'}</p>
        <p className="text-3xl font-black text-purple-400 mb-1">{winnerAr} فازوا!</p>
        <p className={`text-lg mb-6 ${iWon ? 'text-green-400' : 'text-zinc-400'}`}>
          {iWon ? 'أحسنت!' : 'حظ أوفر المرة القادمة'}
        </p>
        <div className="flex gap-10 text-center mb-8">
          <div>
            <p className="text-blue-400 text-sm">🕵️ أبرياء</p>
            <p className="text-blue-300 text-4xl font-black">{scores.innocents}</p>
          </div>
          <div>
            <p className="text-purple-400 text-sm">🎭 إمبوسترز</p>
            <p className="text-purple-300 text-4xl font-black">{scores.impostors}</p>
          </div>
        </div>
        {state.revealedImpostorNames.length > 0 && (
          <div className="bg-purple-900/30 border border-purple-700 rounded-2xl px-6 py-3 mb-6 text-center">
            <p className="text-purple-300 text-sm">الإمبوسترز كانوا</p>
            <p className="text-white font-bold">{state.revealedImpostorNames.join('، ')}</p>
          </div>
        )}
        <Link href="/" className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold px-8 py-3 rounded-xl transition-colors">
          🏠 الرئيسية
        </Link>
      </div>
    )
  }

  if (phase === 'word_reveal') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white" dir="rtl">
        {myWord ? (
          myWord.isImpostor ? (
            <div className="text-center">
              <p className="text-8xl mb-6">🎭</p>
              <p className="text-4xl font-black text-purple-400 mb-3">أنت الإمبوستر!</p>
              <p className="text-zinc-400 text-lg">حاول أن تمتزج مع البقية</p>
              <p className="text-zinc-500 text-sm mt-2">الفئة: {myWord.categoryName}</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-zinc-400 text-lg mb-3">الكلمة السرية</p>
              <div className="bg-zinc-900 border-2 border-green-500 rounded-3xl px-10 py-8 mb-4">
                <p className="text-5xl font-black text-green-300">{myWord.word}</p>
              </div>
              <p className="text-zinc-500 text-sm">الفئة: {myWord.categoryName}</p>
              <p className="text-zinc-600 text-xs mt-2">لا تقل الكلمة مباشرة!</p>
            </div>
          )
        ) : (
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    )
  }

  if (phase === 'discussion') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white" dir="rtl">
        <p className="text-5xl mb-4">🗣</p>
        <p className="text-3xl font-bold mb-2">مرحلة النقاش</p>
        <p className="text-zinc-400 text-center mb-6">
          {myWord?.isImpostor
            ? 'استمع جيداً وحاول تخمين الكلمة'
            : 'صِف الكلمة دون أن تقولها مباشرة'}
        </p>
        {myWord && !myWord.isImpostor && (
          <div className="bg-zinc-900 border border-green-700 rounded-2xl px-8 py-4 mb-4">
            <p className="text-zinc-400 text-sm text-center mb-1">كلمتك</p>
            <p className="text-green-300 text-3xl font-black text-center">{myWord.word}</p>
          </div>
        )}
        {myWord?.isImpostor && (
          <div className="bg-zinc-900 border border-purple-700 rounded-2xl px-8 py-4 mb-4">
            <p className="text-purple-300 text-xl font-bold text-center">🎭 إمبوستر</p>
          </div>
        )}
        <p className="text-zinc-600 text-sm mt-4">الفئة: {state.currentCategoryName}</p>
        {settings.timePerRound > 0 && state.timerStartedAt && (
          <p className="text-zinc-500 text-sm mt-2">
            الوقت: {settings.timePerRound} ثانية
          </p>
        )}
      </div>
    )
  }

  if (phase === 'voting') {
    if (me?.isEliminated) {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-white" dir="rtl">
          <div className="text-center">
            <p className="text-5xl mb-4">💀</p>
            <p className="text-2xl font-bold text-zinc-400">أنت خارج اللعبة</p>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-zinc-950 p-5 text-white" dir="rtl">
        <div className="max-w-sm mx-auto">
          <div className="text-center mb-6">
            <p className="text-4xl mb-2">🗳</p>
            <p className="text-2xl font-bold">من هو الإمبوستر؟</p>
            <p className="text-zinc-400 text-sm mt-1">صوّت لإقصاء لاعب</p>
          </div>

          {voted ? (
            <div className="bg-green-900/40 border-2 border-green-600 rounded-2xl px-6 py-8 text-center">
              <p className="text-green-300 text-2xl font-bold mb-1">✓ تم التصويت</p>
              <p className="text-zinc-400">صوّتت على: <span className="text-white font-bold">{voted}</span></p>
            </div>
          ) : (
            <div className="space-y-3">
              {activePlayers.map((p) => (
                <button
                  key={p.id}
                  onClick={() => submitVote(p.name)}
                  className="w-full bg-zinc-800 hover:bg-red-900/60 border border-zinc-700 hover:border-red-600 text-white font-bold py-4 rounded-2xl text-xl transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'reveal' && voteResult) {
    const iWasEliminated = voteResult.eliminatedName === name
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white" dir="rtl">
        <div className={`w-full max-w-sm rounded-3xl px-6 py-8 text-center border-2 ${
          voteResult.wasImpostor ? 'bg-green-900/30 border-green-500' : 'bg-red-900/30 border-red-500'
        }`}>
          <p className="text-5xl mb-3">{voteResult.wasImpostor ? '✅' : '❌'}</p>
          <p className="text-3xl font-black mb-1">{voteResult.eliminatedName}</p>
          <p className={`text-xl font-bold mb-5 ${voteResult.wasImpostor ? 'text-green-300' : 'text-red-300'}`}>
            {voteResult.wasImpostor ? '🎭 كان إمبوستر!' : '🕵️ كان بريئاً!'}
          </p>
          <div className="border-t border-white/10 pt-4">
            <p className="text-zinc-400 text-sm">الكلمة كانت</p>
            <p className="text-yellow-300 text-3xl font-black mt-1">{voteResult.secretWord}</p>
          </div>
        </div>

        {iWasEliminated && (
          <div className="mt-5 bg-zinc-800 rounded-2xl px-6 py-4 text-center">
            <p className="text-zinc-300 font-bold">تم إقصاؤك هذه الجولة</p>
          </div>
        )}

        <p className="text-zinc-500 text-sm mt-6">في انتظار الجولة التالية...</p>
      </div>
    )
  }

  return null
}

export default function PlayerViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PlayerViewContent />
    </Suspense>
  )
}
