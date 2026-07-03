'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FamilyFeudEntry() {
  const router = useRouter()
  const [tab, setTab] = useState<'host' | 'join'>('host')
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')

  function goSetup() {
    if (!playerName.trim()) return
    router.push(`/games/game2-family-feud/setup?name=${encodeURIComponent(playerName.trim())}`)
  }

  function goJoin() {
    if (!playerName.trim() || roomCode.length < 4) return
    router.push(
      `/games/game2-family-feud/join?code=${roomCode.trim().toUpperCase()}&name=${encodeURIComponent(playerName.trim())}`
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">عائلة فيود</h1>
          <p className="text-zinc-500">لعبة التنافس العائلي</p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-zinc-900 p-1 mb-6">
          <button
            onClick={() => setTab('host')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              tab === 'host' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            استضافة
          </button>
          <button
            onClick={() => setTab('join')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              tab === 'join' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            انضمام
          </button>
        </div>

        {tab === 'host' ? (
          <div className="space-y-4">
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">اسمك</label>
              <input
                dir="rtl"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && goSetup()}
                placeholder="أدخل اسمك"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-4 text-white text-lg placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>
            <button
              onClick={goSetup}
              disabled={!playerName.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-4 rounded-xl text-lg transition-colors"
            >
              إعداد اللعبة ←
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">اسمك</label>
              <input
                dir="rtl"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="أدخل اسمك"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-4 text-white text-lg placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm mb-1 block">رمز الغرفة</label>
              <input
                dir="ltr"
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && goJoin()}
                placeholder="XXXX"
                maxLength={4}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-4 text-white text-3xl tracking-[0.4em] text-center placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={goJoin}
              disabled={!playerName.trim() || roomCode.length < 4}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-4 rounded-xl text-lg transition-colors"
            >
              انضم للعبة
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
