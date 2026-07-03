'use client'

import { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { io, Socket } from 'socket.io-client'
import { IMP_HOST_RECONNECT, IMP_STATE, IMP_ERROR, IMP_START } from '@/shared/socket/events'
import type { ImpStatePayload } from '../types'

function LobbyContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code') ?? ''
  const router = useRouter()

  const [state, setState] = useState<ImpStatePayload | null>(null)
  const [error, setError] = useState('')
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
      if (s.phase !== 'lobby') {
        router.push(`/games/game3-impostor/game-board?code=${code}`)
      }
    })
    socket.on(IMP_ERROR, ({ message }: { message: string }) => setError(message))

    return () => { socket.disconnect() }
  }, [code, router])

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

  const canStart = state.players.length >= 3

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6" dir="rtl">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <p className="text-zinc-400 text-sm mb-1">رمز الغرفة</p>
          <p className="text-5xl font-black tracking-widest text-purple-400">{code}</p>
          <p className="text-zinc-500 text-sm mt-2">شارك الرمز مع اللاعبين</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 mb-6">
          <p className="text-zinc-400 text-sm mb-3">اللاعبون ({state.players.length}/10)</p>
          {state.players.length === 0 ? (
            <p className="text-zinc-600 text-center py-4">في انتظار اللاعبين...</p>
          ) : (
            <div className="space-y-2">
              {state.players.map((p) => (
                <div key={p.id} className="bg-zinc-800 rounded-xl px-4 py-2 text-white font-medium">
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 mb-6 text-sm text-zinc-400 space-y-1">
          <p>🎭 إمبوسترز: <span className="text-white">{state.settings.numImpostors}</span></p>
          <p>⏱ وقت النقاش: <span className="text-white">{state.settings.timePerRound === 0 ? 'غير محدود' : `${state.settings.timePerRound} ثانية`}</span></p>
          <p>🔄 الجولات: <span className="text-white">{state.settings.totalRounds}</span></p>
        </div>

        {!canStart && (
          <p className="text-zinc-500 text-sm text-center mb-4">تحتاج على الأقل ٣ لاعبين للبدء</p>
        )}

        <button
          onClick={() => emit(IMP_START)}
          disabled={!canStart}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-xl transition-colors"
        >
          ابدأ اللعبة
        </button>
      </div>
    </div>
  )
}

export default function LobbyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LobbyContent />
    </Suspense>
  )
}
