'use client'

import { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import {
  PHOTO_RECONNECT, PHOTO_STATE, PHOTO_ERROR,
  PHOTO_YOUR_PHOTO, PHOTO_REVEAL_PHOTO,
} from '@/shared/socket/events'
import type { PhotoStatePayload } from '../types'
import { PLAYER_COLOR_CLASSES } from '../types'
import Image from 'next/image'

function PlayerViewContent() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code') ?? ''
  const name = searchParams.get('name') ?? ''

  const [state, setState] = useState<PhotoStatePayload | null>(null)
  const [error, setError] = useState('')
  const [joinName, setJoinName] = useState(name)
  const [joined, setJoined] = useState(false)

  // Secret photos
  const [myPhoto, setMyPhoto] = useState<string | null>(null)
  const [revealedPhoto, setRevealedPhoto] = useState<string | null>(null)

  const socketRef = useRef<Socket | null>(null)

  const myPlayer = state?.players.find((p) => p.name === joinName) ?? null
  const myColors = myPlayer ? PLAYER_COLOR_CLASSES[myPlayer.colorIndex % PLAYER_COLOR_CLASSES.length] : null

  const emit = useCallback(
    (event: string, data: object = {}) => socketRef.current?.emit(event, { roomCode: code, ...data }),
    [code]
  )

  useEffect(() => {
    if (!code) return
    const socket = io({ reconnectionAttempts: Infinity, reconnectionDelay: 1000, reconnectionDelayMax: 5000 })
    socketRef.current = socket

    socket.on('connect', () => {
      if (joined && joinName) socket.emit(PHOTO_RECONNECT, { roomCode: code, playerName: joinName })
    })
    socket.on(PHOTO_STATE, (s: PhotoStatePayload) => {
      setState(s)
      // Clear revealed photo when new round starts
      if (s.phase === 'playing') setRevealedPhoto(null)
    })
    socket.on(PHOTO_YOUR_PHOTO, ({ photo }: { photo: string }) => setMyPhoto(photo))
    socket.on(PHOTO_REVEAL_PHOTO, ({ photo }: { photo: string }) => setRevealedPhoto(photo))
    socket.on(PHOTO_ERROR, ({ message }: { message: string }) => setError(message))

    return () => { socket.disconnect() }
  }, [code, joined, joinName])

  function handleJoin() {
    if (!joinName.trim()) return
    setJoined(true)
    emit(PHOTO_RECONNECT, { playerName: joinName.trim() })
  }

  if (error) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center" dir="rtl">
      <div className="text-center px-6">
        <p className="text-red-400 text-xl mb-4">{error}</p>
        <button onClick={() => setError('')} className="text-indigo-400 hover:text-indigo-300">حاول مرة أخرى</button>
      </div>
    </div>
  )

  if (!joined) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6" dir="rtl">
      <p className="text-5xl mb-4">📸</p>
      <h1 className="text-3xl font-black text-white mb-2">لعبة الصور</h1>
      <p className="text-indigo-400 text-4xl font-black tracking-widest mb-8">{code}</p>
      <div className="w-full max-w-xs">
        <input
          type="text"
          value={joinName}
          onChange={(e) => setJoinName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          placeholder="اسمك"
          maxLength={20}
          className="w-full bg-zinc-800 border border-zinc-600 rounded-2xl px-4 py-3 text-white text-center text-xl focus:outline-none focus:border-indigo-500 mb-4"
        />
        <button
          onClick={handleJoin}
          disabled={!joinName.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold py-4 rounded-2xl text-xl transition-colors"
        >
          انضم
        </button>
      </div>
    </div>
  )

  if (!state) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const { phase, currentRound, settings } = state

  // ── Lobby ─────────────────────────────────────────────────────────────────
  if (phase === 'lobby') return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${myColors?.phoneBg ?? 'bg-zinc-900'}`} dir="rtl">
      <p className="text-white text-2xl font-black mb-3">{joinName}</p>
      <p className="text-white text-opacity-80 text-lg">في انتظار بدء اللعبة...</p>
    </div>
  )

  // ── Finished ──────────────────────────────────────────────────────────────
  if (phase === 'finished') {
    const sorted = [...state.players].sort((a, b) => b.score - a.score)
    const rank = sorted.findIndex((p) => p.name === joinName) + 1
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white" dir="rtl">
        <p className="text-6xl mb-3">🏁</p>
        <h1 className="text-3xl font-black text-indigo-400 mb-2">انتهت اللعبة!</h1>
        {myPlayer && <p className="text-2xl font-bold mb-1">نقاطك: <span className={myColors?.text ?? 'text-white'}>{myPlayer.score}</span></p>}
        <p className="text-zinc-400 text-lg">المركز {rank}</p>
      </div>
    )
  }

  // ── Playing phase — show MY secret photo ──────────────────────────────────
  if (phase === 'playing') return (
    <div className={`min-h-screen flex flex-col ${myColors?.phoneBg ?? 'bg-zinc-900'}`} dir="rtl">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <p className="text-white font-black text-lg">{joinName}</p>
        <p className="text-white text-opacity-70 text-sm">{currentRound} / {settings.totalRounds}</p>
        <p className="text-white font-bold">{myPlayer?.score ?? 0} نقطة</p>
      </div>

      <p className="text-white text-opacity-60 text-center text-sm mb-2">صورتك السرية</p>

      <div className="flex-1 mx-4 mb-4 rounded-2xl overflow-hidden relative min-h-64 bg-zinc-800">
        {myPhoto ? (
          <Image src={myPhoto} alt="صورتك السرية" fill className="object-contain" unoptimized />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      <p className="text-white text-opacity-50 text-center text-xs pb-4 px-4">
        صف صورتك للاعب الثاني دون ما تريه الشاشة
      </p>
    </div>
  )

  // ── Reveal phase — show THE OTHER player's photo ──────────────────────────
  if (phase === 'reveal') return (
    <div className={`min-h-screen flex flex-col ${myColors?.phoneBg ?? 'bg-zinc-900'}`} dir="rtl">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <p className="text-white font-black text-lg">{joinName}</p>
        <p className="text-white text-opacity-70 text-sm">{currentRound} / {settings.totalRounds}</p>
        <p className="text-white font-bold">{myPlayer?.score ?? 0} نقطة</p>
      </div>

      <p className="text-white text-center font-bold text-lg mb-2">صورة خصمك</p>

      <div className="flex-1 mx-4 mb-4 rounded-2xl overflow-hidden relative min-h-64 bg-zinc-800">
        {revealedPhoto ? (
          <Image src={revealedPhoto} alt="صورة الخصم" fill className="object-contain" unoptimized />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  )

  return null
}

export default function PhotoGamePlayerViewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <PlayerViewContent />
    </Suspense>
  )
}
