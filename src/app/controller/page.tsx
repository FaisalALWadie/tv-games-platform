'use client'

import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export default function ControllerPage() {
  const [gameActive, setGameActive] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io({ reconnectionAttempts: Infinity, reconnectionDelay: 1000, reconnectionDelayMax: 5000 })
    socketRef.current = socket

    socket.on('GAME_STARTED', () => {
      setGameActive(true)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8">
      {gameActive ? (
        <p className="text-white text-2xl font-semibold">اللعبة نشطة</p>
      ) : (
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin mx-auto mb-6" />
          <p className="text-zinc-400 text-xl">في انتظار بدء اللعبة...</p>
        </div>
      )}
    </div>
  )
}
