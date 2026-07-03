'use client'

import { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { io, Socket } from 'socket.io-client'
import type { RoomStatePayload, AnswerResultPayload } from '../types'
import {
  FF_RECONNECT,
  FF_STATE,
  FF_ERROR,
  FF_BUZZ,
  FF_SUBMIT_ANSWER,
  FF_ANSWER_RESULT,
} from '@/shared/socket/events'
import PlayerInput from '../components/player-input'
import { sounds } from '../utils/sounds'

type FeedbackKind = 'correct' | 'wrong' | null

function PlayerViewContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code') ?? ''
  const name = searchParams.get('name') ?? ''
  const teamId = Number(searchParams.get('team') ?? '1') as 1 | 2

  const [state, setState] = useState<RoomStatePayload | null>(null)
  const [feedback, setFeedback] = useState<FeedbackKind>(null)
  const [feedbackPoints, setFeedbackPoints] = useState<number | null>(null)
  const [shake, setShake] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [error, setError] = useState('')

  const socketRef = useRef<Socket | null>(null)
  const mySocketIdRef = useRef('')
  const [mySocketId, setMySocketId] = useState('')

  const showFeedback = useCallback((kind: FeedbackKind, points?: number) => {
    setFeedback(kind)
    setFeedbackPoints(points ?? null)
    if (kind === 'correct') {
      sounds.play('correct')
    } else if (kind === 'wrong') {
      sounds.play('wrong')
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
    setTimeout(() => { setFeedback(null); setFeedbackPoints(null) }, 2800)
  }, [])

  useEffect(() => {
    if (!code || !name) return
    const socket = io({ reconnection: true, reconnectionDelay: 1000, reconnectionAttempts: 10 })
    socketRef.current = socket

    socket.on('connect', () => {
      mySocketIdRef.current = socket.id ?? ''
      setMySocketId(socket.id ?? '')
      setIsReconnecting(false)
      socket.emit(FF_RECONNECT, { roomCode: code, playerName: name, teamId })
    })

    socket.on('disconnect', () => {
      setIsReconnecting(true)
    })

    socket.on(FF_STATE, (s: RoomStatePayload) => {
      setState(s)
    })

    socket.on(FF_ANSWER_RESULT, (result: AnswerResultPayload) => {
      if (result.playerId === mySocketIdRef.current) {
        showFeedback(result.correct ? 'correct' : 'wrong', result.points)
      }
    })

    socket.on(FF_ERROR, ({ message }: { message: string }) => setError(message))

    return () => { socket.disconnect() }
  }, [code, name, teamId, showFeedback])

  function buzz() {
    sounds.play('buzzer')
    socketRef.current?.emit(FF_BUZZ, { roomCode: code })
  }

  function submitAnswer(answer: string) {
    socketRef.current?.emit(FF_SUBMIT_ANSWER, { roomCode: code, answer })
  }

  // Reconnecting overlay
  if (isReconnecting) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-xl font-semibold">جاري إعادة الاتصال...</p>
          <p className="text-zinc-500 text-sm mt-2">لا تغلق الصفحة</p>
        </div>
      </div>
    )
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

  // Derived from server state (single source of truth)
  const myTeam = state?.teams[teamId] ?? null
  const isLockedOut = myTeam?.isLockedOut ?? false
  const isMyTurn = state?.buzzer?.buzzedPlayerId === mySocketId
  const someoneBuzzed = (state?.buzzer?.buzzedPlayerId ?? null) !== null && !isMyTurn
  const canBuzz = state?.status === 'playing' && !isLockedOut && !someoneBuzzed && !isMyTurn

  const teamColor = teamId === 1 ? 'text-orange-400' : 'text-blue-400'
  const teamBorder = isMyTurn
    ? (teamId === 1 ? 'border-orange-500' : 'border-blue-500')
    : 'border-zinc-700'
  const teamName = myTeam?.name ?? (teamId === 1 ? 'الفريق الأول' : 'الفريق الثاني')

  return (
    <div className="min-h-screen bg-zinc-950 p-5 text-white" dir="rtl">
      <div className="max-w-sm mx-auto">

        {/* Player badge */}
        <div className={`border-2 ${teamBorder} rounded-2xl p-4 mb-5 text-center transition-colors duration-300`}>
          <p className="text-zinc-400 text-sm">{name}</p>
          <p className={`font-bold text-lg ${teamColor}`}>{teamName}</p>
          {myTeam && (
            <p className="text-zinc-500 text-sm mt-1">{myTeam.score} نقطة</p>
          )}
        </div>

        {/* Waiting for game */}
        {state?.status === 'waiting' && (
          <div className="text-center py-10">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-500">في انتظار بدء اللعبة...</p>
          </div>
        )}

        {/* Game over */}
        {state?.status === 'game_over' && (
          <div className="text-center py-8">
            <p className="text-zinc-400 text-xl mb-4">انتهت اللعبة!</p>
            <Link
              href="/"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl transition-colors"
            >
              الرئيسية
            </Link>
          </div>
        )}

        {/* Question end */}
        {state?.status === 'question_end' && state.question && (
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-4 mb-4 text-center">
            <p className="text-zinc-300 font-semibold">✓ انتهت الجولة</p>
            <p className="text-zinc-500 text-sm mt-1">في انتظار المضيف...</p>
          </div>
        )}

        {/* Playing */}
        {state?.status === 'playing' && state.question && (
          <>
            {/* Question */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 mb-4 text-center">
              <p className="text-white text-xl font-semibold leading-relaxed">
                {state.question.text}
              </p>
            </div>

            {/* Team locked out */}
            {isLockedOut && (
              <div className="bg-red-900/30 border-2 border-red-700 rounded-2xl px-4 py-6 text-center">
                <p className="text-red-300 font-bold text-2xl mb-1">🔒 فريقك خارج اللعبة</p>
                <p className="text-red-400/70 text-sm">وصل فريقك إلى ٣ أخطاء</p>
              </div>
            )}

            {/* My turn — show answer input */}
            {isMyTurn && !isLockedOut && (
              <div className="bg-green-900/40 border-2 border-green-500 rounded-2xl p-5 mb-4">
                <p className="text-green-300 font-bold text-center text-xl mb-4">
                  ⚡ دورك! اكتب إجابتك
                </p>
                <PlayerInput onSubmit={submitAnswer} disabled={false} shake={shake} />
              </div>
            )}

            {/* Someone else buzzed */}
            {someoneBuzzed && !isLockedOut && (
              <div className="bg-yellow-900/30 border border-yellow-700 rounded-2xl px-4 py-5 text-center">
                <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-yellow-300 font-bold text-lg">
                  {state.buzzer.buzzedPlayerName} يجاوب الآن...
                </p>
                <p className="text-yellow-500/70 text-sm mt-1">
                  {state.buzzer.buzzedTeamId
                    ? state.teams[state.buzzer.buzzedTeamId].name
                    : ''}
                </p>
              </div>
            )}

            {/* BUZZ button */}
            {canBuzz && (
              <button
                onClick={buzz}
                className="w-full rounded-3xl bg-gradient-to-br from-red-600 to-orange-500 active:from-red-700 active:to-orange-600 active:scale-95 text-white transition-transform duration-100 shadow-2xl py-14 mb-4"
              >
                <span className="block text-6xl mb-3">🔴</span>
                <span className="block font-black text-4xl">اضغط للإجابة!</span>
              </button>
            )}

            {/* Mistake dots */}
            {myTeam && (
              <div className="flex justify-center gap-3 mt-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full transition-colors ${
                      i <= myTeam.mistakes ? 'bg-red-500' : 'bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Feedback overlay */}
        {feedback && (
          <div
            className={`mt-4 text-center text-xl font-bold py-5 rounded-2xl animate-bounce-in ${
              feedback === 'correct'
                ? 'bg-green-900/60 border border-green-700 text-green-300'
                : 'bg-red-900/60 border border-red-700 text-red-300'
            }`}
          >
            {feedback === 'correct' && (
              <>
                ✓ إجابة صحيحة!
                {feedbackPoints != null && (
                  <span className="mr-2 text-yellow-400">+{feedbackPoints}</span>
                )}
              </>
            )}
            {feedback === 'wrong' && '✗ إجابة خاطئة'}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PlayerViewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PlayerViewContent />
    </Suspense>
  )
}
