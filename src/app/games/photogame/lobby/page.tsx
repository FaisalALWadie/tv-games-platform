'use client'

import { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { PHOTO_HOST_RECONNECT, PHOTO_STATE, PHOTO_ERROR, PHOTO_START } from '@/shared/socket/events'
import type { PhotoStatePayload } from '../types'
import { PHOTO_CATEGORIES } from '../categories'

function LobbyContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code') ?? ''
  const router = useRouter()

  const [state, setState] = useState<PhotoStatePayload | null>(null)
  const [error, setError] = useState('')
  const socketRef = useRef<Socket | null>(null)

  const emit = useCallback(
    (event: string, data: object = {}) => socketRef.current?.emit(event, { roomCode: code, ...data }),
    [code]
  )

  useEffect(() => {
    if (!code) return
    const socket = io({ reconnectionAttempts: Infinity, reconnectionDelay: 1000, reconnectionDelayMax: 5000 })
    socketRef.current = socket
    socket.on('connect', () => socket.emit(PHOTO_HOST_RECONNECT, { roomCode: code }))
    socket.on(PHOTO_STATE, (s: PhotoStatePayload) => {
      setState(s)
      if (s.phase !== 'lobby') router.push(`/games/photogame/game-board?code=${code}`)
    })
    socket.on(PHOTO_ERROR, ({ message }: { message: string }) => setError(message))
    return () => { socket.disconnect() }
  }, [code, router])

  if (error) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <p className="text-red-400 text-xl mb-4">{error}</p>
        <a href="/games/photogame" className="text-indigo-400 hover:text-indigo-300">عودة</a>
      </div>
    </div>
  )

  if (!state) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const catNames = state.settings.selectedCategories
    .map((id) => PHOTO_CATEGORIES.find((c) => c.id === id))
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6" dir="rtl">
      <div className="max-w-sm mx-auto">

        <div className="text-center mb-8">
          <p className="text-zinc-400 text-sm mb-1">رمز الغرفة</p>
          <p className="text-6xl font-black tracking-widest text-indigo-400">{code}</p>
          <p className="text-zinc-500 text-sm mt-2">شارك الرمز مع اللاعب الثاني</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 mb-5">
          <p className="text-zinc-400 text-sm mb-3">اللاعبون ({state.players.length}/2)</p>
          {state.players.length === 0
            ? <p className="text-zinc-600 text-center py-4">في انتظار اللاعبين...</p>
            : <div className="space-y-2">
                {state.players.map((p) => (
                  <div key={p.id} className="bg-zinc-800 rounded-xl px-4 py-2 flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-white font-medium">{p.name}</span>
                  </div>
                ))}
              </div>
          }
        </div>

        <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 mb-6 text-sm text-zinc-400 space-y-1">
          <p>🎯 الجولات: <span className="text-white">{state.settings.totalRounds}</span></p>
          <p>📂 الفئات: <span className="text-white">{catNames.map((c) => `${c!.emoji} ${c!.nameAr}`).join(' · ')}</span></p>
        </div>

        {state.players.length < 2 && (
          <p className="text-zinc-500 text-sm text-center mb-4">في انتظار لاعبَين على الأقل</p>
        )}

        <button
          onClick={() => emit(PHOTO_START)}
          disabled={state.players.length < 2}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-xl transition-colors"
        >
          ابدأ اللعبة
        </button>

        <a href="/games/photogame" className="block text-center text-zinc-500 hover:text-zinc-300 text-sm mt-4 transition-colors">
          رجوع
        </a>
      </div>
    </div>
  )
}

export default function PhotoGameLobbyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <LobbyContent />
    </Suspense>
  )
}
