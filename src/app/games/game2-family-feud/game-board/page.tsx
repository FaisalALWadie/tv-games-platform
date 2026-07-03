'use client'

import { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { io, Socket } from 'socket.io-client'
import type { RoomStatePayload, AnswerResultPayload } from '../types'
import {
  FF_STATE,
  FF_ERROR,
  FF_ANSWER_RESULT,
  FF_HOST_RECONNECT,
  FF_HOST_NEXT,
  FF_HOST_RESTART,
  FF_HOST_REVEAL,
  FF_HOST_MISTAKE,
  FF_HOST_UPDATE_SCORES,
  FF_HOST_JUMP,
  FF_HOST_END,
  FF_HOST_RESET_ATTEMPTS,
  FF_HOST_RESTART_SAME_TEAMS,
} from '@/shared/socket/events'
import AnswerSlot from '../components/answer-slot'
import TeamScoreboard from '../components/team-scoreboard'
import { sounds } from '../utils/sounds'

function GameBoardContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code') ?? ''

  const [state, setState] = useState<RoomStatePayload | null>(null)
  const [lastResult, setLastResult] = useState<AnswerResultPayload | null>(null)
  const [error, setError] = useState('')
  const [showScoreModal, setShowScoreModal] = useState(false)
  const [showJumpModal, setShowJumpModal] = useState(false)
  const [editScore1, setEditScore1] = useState('')
  const [editScore2, setEditScore2] = useState('')
  const [isMuted, setIsMuted] = useState(false)

  const socketRef = useRef<Socket | null>(null)
  const prevStatusRef = useRef('')

  const emit = useCallback(
    (event: string, data: object = {}) => {
      socketRef.current?.emit(event, { roomCode: code, ...data })
    },
    [code]
  )

  useEffect(() => {
    if (!code) return
    const socket = io()
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit(FF_HOST_RECONNECT, { roomCode: code })
    })

    socket.on(FF_STATE, (s: RoomStatePayload) => {
      setState(s)
    })

    socket.on(FF_ANSWER_RESULT, (result: AnswerResultPayload) => {
      setLastResult(result)
      setTimeout(() => setLastResult(null), 3000)
    })

    socket.on(FF_ERROR, ({ message }: { message: string }) => setError(message))

    return () => { socket.disconnect() }
  }, [code])

  // Sound effects triggered by answer results
  useEffect(() => {
    if (!lastResult) return
    if (lastResult.correct) {
      sounds.play('correct')
    } else {
      sounds.play('wrong')
    }
  }, [lastResult])

  // Sound effects triggered by status transitions
  useEffect(() => {
    if (!state) return
    const prev = prevStatusRef.current
    if (prev === '') {
      prevStatusRef.current = state.status
      return
    }
    if (state.status === 'game_over' && prev !== 'game_over') {
      sounds.play('winner')
    } else if (state.status === 'question_end' && prev === 'playing') {
      sounds.play('roundEnd')
    }
    // Detect new lockout
    if (state.status === 'playing' && prev === 'playing') {
      if (state.teams[1].isLockedOut || state.teams[2].isLockedOut) {
        sounds.play('lockout')
      }
    }
    prevStatusRef.current = state.status
  }, [state])

  function toggleSound() {
    setIsMuted(sounds.toggleMute())
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-400 text-2xl mb-4">{error}</p>
          <Link href="/games/game2-family-feud" className="text-indigo-400 hover:text-indigo-300">عودة</Link>
        </div>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const answers = state.question?.answers ?? []
  const isQuestionEnd = state.status === 'question_end'
  const isGameOver = state.status === 'game_over'
  const buzzedTeamName = state.buzzer.buzzedTeamId
    ? state.teams[state.buzzer.buzzedTeamId].name
    : ''

  const unrevealedIndices = answers
    .map((a, i) => ({ a, i }))
    .filter(({ a }) => !a.revealed)
    .map(({ i }) => i)

  function openScoreModal() {
    setEditScore1(String(state!.teams[1].score))
    setEditScore2(String(state!.teams[2].score))
    setShowScoreModal(true)
  }

  function saveScores() {
    emit(FF_HOST_UPDATE_SCORES, {
      team1Score: parseInt(editScore1) || 0,
      team2Score: parseInt(editScore2) || 0,
    })
    setShowScoreModal(false)
  }

  // Game over screen
  if (isGameOver) {
    const winTeam = state.winner ? state.teams[state.winner] : null
    const t1 = state.teams[1], t2 = state.teams[2]
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white" dir="rtl">
        <p className="text-yellow-400 text-6xl mb-4">🏆</p>
        <h1 className="text-5xl font-bold text-yellow-400 mb-2">{winTeam?.name ?? 'تعادل!'}</h1>
        <p className="text-zinc-400 text-xl mb-8">يفوز باللعبة</p>

        <div className="flex gap-12 text-center mb-10">
          <div>
            <p className="text-orange-400 font-bold text-lg">{t1.name}</p>
            <p className="text-orange-300 text-4xl font-bold">{t1.score}</p>
          </div>
          <div className="text-zinc-600 text-3xl self-center">vs</div>
          <div>
            <p className="text-blue-400 font-bold text-lg">{t2.name}</p>
            <p className="text-blue-300 text-4xl font-bold">{t2.score}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 items-center w-72">
          <button
            onClick={() => emit(FF_HOST_RESTART_SAME_TEAMS)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-4 rounded-2xl text-xl transition-colors"
          >
            🔄 إعادة اللعبة
          </button>
          <Link
            href="/games/game2-family-feud"
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold px-10 py-4 rounded-2xl text-xl transition-colors text-center"
          >
            ✏️ إعداد جديد
          </Link>
          <Link
            href="/"
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-10 py-4 rounded-2xl text-xl transition-colors text-center"
          >
            🏠 الرئيسية
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-36" dir="rtl">

      {/* Answer result toast */}
      {lastResult && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl text-lg font-bold shadow-2xl animate-bounce-in whitespace-nowrap ${
          lastResult.correct
            ? 'bg-green-900/90 border border-green-600 text-green-200'
            : 'bg-red-900/90 border border-red-700 text-red-200'
        }`}>
          {lastResult.correct
            ? `✓ ${lastResult.playerName}${lastResult.teamId ? ` (${state.teams[lastResult.teamId].name})` : ''} — ${lastResult.points} نقطة`
            : `✗ ${lastResult.playerName} — إجابة خاطئة`}
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 pt-4">

        {/* Progress */}
        <p className="text-center text-zinc-500 text-sm mb-4">
          السؤال {state.questionIndex + 1} من {state.settings.totalRounds}
        </p>

        {/* Scoreboards */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <TeamScoreboard team={state.teams[1]} />
          <TeamScoreboard team={state.teams[2]} />
        </div>

        {/* Buzzer banner — who is answering right now */}
        {state.buzzer.buzzedPlayerId !== null && (
          <div className="bg-yellow-900/40 border-2 border-yellow-500 rounded-2xl px-6 py-4 mb-4 text-center animate-bounce-in">
            <p className="text-yellow-200 font-bold text-2xl">
              ⚡ {state.buzzer.buzzedPlayerName}
              {buzzedTeamName && (
                <span className="text-yellow-400/70 font-normal text-lg mr-2">({buzzedTeamName})</span>
              )}
            </p>
            <p className="text-yellow-500/70 text-sm mt-1">يكتب إجابته الآن...</p>
          </div>
        )}

        {/* Question */}
        {state.question && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl px-6 py-5 mb-5 text-center">
            <p className="text-white text-2xl font-bold leading-relaxed">
              {state.question.text}
            </p>
          </div>
        )}

        {/* Question-end banner */}
        {isQuestionEnd && (
          <div className="bg-green-900/30 border-2 border-green-600 rounded-xl px-4 py-3 mb-4 text-center animate-fade-up">
            <p className="text-green-300 font-bold text-lg">✓ انتهت الجولة — اضغط [التالي] للمتابعة</p>
          </div>
        )}

        {/* Answer slots */}
        {answers.length > 0 && (
          <div className={`grid gap-3 ${answers.length > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {answers.map((answer, i) => (
              <AnswerSlot
                key={i}
                answer={answer}
                rank={i + 1}
                animateReveal={lastResult?.correct === true && lastResult.answerIndex === i}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Host control panel ─────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t-4 border-yellow-500 px-3 py-3 z-40">
        <div className="max-w-5xl mx-auto">

          {/* Row 1: navigation + game controls */}
          <div className="flex gap-2 flex-wrap mb-2 items-center justify-center">
            <button
              onClick={() => emit(FF_HOST_NEXT)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                isQuestionEnd
                  ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse'
                  : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'
              }`}
            >
              ⏭️ التالي
            </button>

            <button
              onClick={() => emit(FF_HOST_RESTART)}
              className="px-4 py-2 rounded-xl font-bold text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
            >
              🔄 إعادة
            </button>

            <button
              onClick={() => emit(FF_HOST_RESET_ATTEMPTS)}
              className="px-4 py-2 rounded-xl font-bold text-sm bg-purple-900/60 hover:bg-purple-900 text-purple-300 border border-purple-700/50 transition-colors"
              title="تحرير زر الإجابة للجميع دون مسح الإجابات أو النقاط"
            >
              🔓 تحرير الزر
            </button>

            <div className="w-px h-6 bg-zinc-700 mx-1" />

            <button
              onClick={() => emit(FF_HOST_MISTAKE, { teamId: 1 })}
              className="px-3 py-2 rounded-xl font-bold text-sm bg-orange-900/60 hover:bg-orange-900 text-orange-300 border border-orange-700/50 transition-colors"
            >
              ✗ {state.teams[1].name}
            </button>

            <button
              onClick={() => emit(FF_HOST_MISTAKE, { teamId: 2 })}
              className="px-3 py-2 rounded-xl font-bold text-sm bg-blue-900/60 hover:bg-blue-900 text-blue-300 border border-blue-700/50 transition-colors"
            >
              ✗ {state.teams[2].name}
            </button>

            <div className="w-px h-6 bg-zinc-700 mx-1" />

            <button
              onClick={openScoreModal}
              className="px-3 py-2 rounded-xl font-bold text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
            >
              🔢 نقاط
            </button>

            <button
              onClick={() => setShowJumpModal(true)}
              className="px-3 py-2 rounded-xl font-bold text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
            >
              🎯 قفز
            </button>

            <button
              onClick={toggleSound}
              className="px-3 py-2 rounded-xl font-bold text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors"
              title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>

            <button
              onClick={() => emit(FF_HOST_END)}
              className="px-3 py-2 rounded-xl font-bold text-sm bg-red-900/60 hover:bg-red-900 text-red-300 border border-red-700/50 transition-colors"
            >
              🏁 إنهاء
            </button>
          </div>

          {/* Row 2: manual reveal */}
          {unrevealedIndices.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-center">
              {unrevealedIndices.map((idx) => (
                <button
                  key={idx}
                  onClick={() => emit(FF_HOST_REVEAL, { answerIndex: idx })}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-800/60 hover:bg-yellow-700/80 text-yellow-300 border border-yellow-700/50 transition-colors"
                >
                  كشف {idx + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Scores Modal */}
      {showScoreModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-white font-bold text-lg mb-5">تعديل النقاط</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-orange-400 text-sm mb-1 block">{state.teams[1].name}</label>
                <input
                  type="number"
                  value={editScore1}
                  onChange={(e) => setEditScore1(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="text-blue-400 text-sm mb-1 block">{state.teams[2].name}</label>
                <input
                  type="number"
                  value={editScore2}
                  onChange={(e) => setEditScore2(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowScoreModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3 rounded-xl transition-colors">إلغاء</button>
              <button onClick={saveScores} className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors">حفظ</button>
            </div>
          </div>
        </div>
      )}

      {/* Jump to Question Modal */}
      {showJumpModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-white font-bold text-lg mb-4">قفز إلى سؤال</h2>
            <div className="grid grid-cols-5 gap-2 mb-5">
              {Array.from({ length: state.settings.totalRounds }, (_, i) => (
                <button
                  key={i}
                  onClick={() => { emit(FF_HOST_JUMP, { questionIndex: i }); setShowJumpModal(false) }}
                  className={`py-3 rounded-xl font-bold text-sm transition-colors ${
                    i === state.questionIndex
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button onClick={() => setShowJumpModal(false)} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold py-3 rounded-xl transition-colors">إلغاء</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GameBoardPage() {
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
