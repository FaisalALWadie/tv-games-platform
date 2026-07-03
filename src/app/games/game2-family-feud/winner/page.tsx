'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { io } from 'socket.io-client'
import type { RoomStatePayload } from '../types'
import { FF_STATE } from '@/shared/socket/events'
import WinnerCard from '../components/winner-card'

function WinnerContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code') ?? ''
  const [state, setState] = useState<RoomStatePayload | null>(null)

  useEffect(() => {
    const socket = io()
    socket.on('connect', () => {
      socket.emit('FF_BOARD_JOIN', { roomCode: code })
    })
    socket.on(FF_STATE, (s: RoomStatePayload) => {
      setState(s)
    })
    return () => {
      socket.disconnect()
    }
  }, [code])

  if (!state) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6"
      dir="rtl"
    >
      <WinnerCard winner={state.winner ?? 1} teams={state.teams} />
      <Link
        href="/"
        className="mt-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-10 py-4 rounded-2xl text-lg transition-colors"
      >
        العودة للرئيسية
      </Link>
    </div>
  )
}

export default function WinnerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WinnerContent />
    </Suspense>
  )
}
