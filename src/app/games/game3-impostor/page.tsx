'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ImpostorEntryPage() {
  const router = useRouter()
  const [joinCode, setJoinCode] = useState('')
  const [joinName, setJoinName] = useState('')
  const [view, setView] = useState<'menu' | 'join'>('menu')
  const [error, setError] = useState('')

  function handleJoin() {
    const code = joinCode.trim().toUpperCase()
    const name = joinName.trim()
    if (!code || code.length !== 4) { setError('أدخل رمز غرفة صحيح'); return }
    if (!name) { setError('أدخل اسمك'); return }
    router.push(`/games/game3-impostor/player-view?code=${code}&name=${encodeURIComponent(name)}`)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white" dir="rtl">
      <div className="max-w-sm w-full">
        <div className="text-center mb-10">
          <p className="text-6xl mb-3">🎭</p>
          <h1 className="text-4xl font-black text-white mb-1">من الإمبوستر؟</h1>
          <p className="text-zinc-400 text-sm">لعبة الاكتشاف الاجتماعي</p>
        </div>

        {view === 'menu' && (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => router.push('/games/game3-impostor/setup')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl text-xl transition-colors"
            >
              إنشاء غرفة
            </button>
            <button
              onClick={() => setView('join')}
              className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-4 rounded-2xl text-xl transition-colors"
            >
              انضمام
            </button>
            <Link
              href="/"
              className="text-center text-zinc-500 hover:text-zinc-300 text-sm transition-colors mt-2"
            >
              العودة للرئيسية
            </Link>
          </div>
        )}

        {view === 'join' && (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="رمز الغرفة (4 أحرف)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center text-2xl font-bold tracking-widest focus:outline-none focus:border-purple-500 uppercase"
            />
            <input
              type="text"
              placeholder="اسمك"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              maxLength={20}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-center text-lg focus:outline-none focus:border-purple-500"
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              onClick={handleJoin}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl text-xl transition-colors"
            >
              انضمام
            </button>
            <button
              onClick={() => { setView('menu'); setError('') }}
              className="text-center text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
            >
              رجوع
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
