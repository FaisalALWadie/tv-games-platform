'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import type { RoomState } from '@/shared/types/room'
import {
  ROOM_JOIN,
  ROOM_STATE,
  ROOM_ERROR,
} from '@/shared/socket/events'

type Phase = 'form' | 'waiting'

export default function JoinPage() {
  const [phase, setPhase] = useState<Phase>('form')
  const [code, setCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [room, setRoom] = useState<RoomState | null>(null)
  const [error, setError] = useState('')
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const socket = io({ reconnectionAttempts: Infinity, reconnectionDelay: 1000, reconnectionDelayMax: 5000 })
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit(ROOM_JOIN, { code: code.toUpperCase(), playerName })
    })

    socket.on(ROOM_STATE, (state: RoomState) => {
      setRoom(state)
      setPhase('waiting')
    })

    socket.on(ROOM_ERROR, ({ message }: { message: string }) => {
      setError(message)
      socket.disconnect()
    })
  }

  if (phase === 'waiting' && room) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2">انضممت بنجاح!</h1>
          <p className="text-zinc-400 mb-8">في انتظار بدء اللعبة...</p>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <p className="text-zinc-500 text-sm mb-3">اللاعبون في الغرفة</p>
            <ul className="space-y-2">
              {room.players.map((player) => (
                <li key={player.id} className="flex items-center gap-2 justify-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className={player.name === playerName ? 'text-indigo-400 font-semibold' : ''}>
                    {player.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-white text-center mb-2">انضم للعبة</h1>
        <p className="text-zinc-500 text-center mb-8">أدخل رمز الغرفة واسمك</p>

        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="رمز الغرفة (4 أحرف)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={4}
            className="bg-zinc-900 border border-zinc-800 text-white text-center text-3xl font-bold tracking-widest rounded-2xl px-4 py-5 outline-none focus:ring-2 focus:ring-indigo-500 uppercase placeholder:text-zinc-700 placeholder:text-base placeholder:font-normal placeholder:tracking-normal"
            required
          />
          <input
            type="text"
            placeholder="اسمك"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
            className="bg-zinc-900 border border-zinc-800 text-white rounded-2xl px-4 py-4 text-lg outline-none focus:ring-2 focus:ring-indigo-500 text-center placeholder:text-zinc-700"
            required
          />
          {error && (
            <p className="text-red-400 text-sm text-center bg-red-950/30 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl text-lg transition-colors mt-2"
          >
            انضم الآن
          </button>
        </form>
      </div>
    </div>
  )
}
