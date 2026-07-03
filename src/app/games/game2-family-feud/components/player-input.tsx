'use client'

import { useState } from 'react'

interface Props {
  onSubmit: (answer: string) => void
  disabled: boolean
  shake: boolean
}

export default function PlayerInput({ onSubmit, disabled, shake }: Props) {
  const [value, setValue] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSubmit(trimmed)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        dir="rtl"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder="اكتب إجابتك هنا..."
        className={`w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-4 text-white text-xl placeholder-zinc-600 focus:outline-none focus:border-indigo-500 disabled:opacity-50 ${
          shake ? 'animate-shake border-red-500' : ''
        }`}
        autoComplete="off"
        autoFocus
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-5 rounded-xl text-xl transition-colors"
      >
        أرسل
      </button>
    </form>
  )
}
