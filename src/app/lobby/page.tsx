'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import type { RoomState } from '@/shared/types/room'
import {
  ROOM_CREATE,
  ROOM_STATE,
  ROOM_ERROR,
} from '@/shared/socket/events'

function LobbyContent() {
  const searchParams = useSearchParams()
  const gameId = searchParams.get('game') ?? 'unknown'

  const [room, setRoom] = useState<RoomState | null>(null)
  const [error, setError] = useState('')
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io()
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit(ROOM_CREATE, { gameId })
    })

    socket.on(ROOM_STATE, (state: RoomState) => {
      setRoom(state)
    })

    socket.on(ROOM_ERROR, ({ message }: { message: string }) => {
      setError(message)
    })

    return () => {
      socket.disconnect()
    }
  }, [gameId])

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <Link href="/" className="text-indigo-400 hover:text-indigo-300">العودة للرئيسية</Link>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-6 md:p-10 text-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center text-zinc-400 mb-8">غرفة اللعب</h1>

        {/* Room code — big for TV display */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-center mb-8">
          <p className="text-zinc-500 text-sm mb-3 uppercase tracking-widest">رمز الغرفة</p>
          <p className="text-8xl font-bold tracking-[0.2em] text-indigo-400">{room.code}</p>
          <p className="text-zinc-600 mt-4 text-sm">
            اطلب من اللاعبين الدخول على الرابط وإدخال هذا الرمز
          </p>
        </div>

        {/* Player list */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">اللاعبون</h2>
            <span className="text-zinc-500 text-sm">{room.players.length} / 10</span>
          </div>
          {room.players.length === 0 ? (
            <p className="text-zinc-600 text-sm">في انتظار انضمام اللاعبين...</p>
          ) : (
            <ul className="space-y-2">
              {room.players.map((player) => (
                <li key={player.id} className="flex items-center gap-3 py-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
                  <span className="text-white">{player.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Start button */}
        <button
          disabled={room.players.length < 2}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-4 rounded-2xl text-lg transition-colors"
        >
          {room.players.length < 2 ? 'في انتظار لاعبَين على الأقل' : 'ابدأ اللعبة'}
        </button>
      </div>
    </div>
  )
}

export default function LobbyPage() {
  return (
    <Suspense>
      <LobbyContent />
    </Suspense>
  )
}
