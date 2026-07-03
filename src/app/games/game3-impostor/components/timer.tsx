'use client'

import { useEffect, useState } from 'react'

interface Props {
  endsAt: number | null
  onExpire?: () => void
}

export default function Timer({ endsAt, onExpire }: Props) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (endsAt === null) return
    const tick = () => {
      const diff = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
      setRemaining(diff)
      if (diff === 0) onExpire?.()
    }
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [endsAt, onExpire])

  if (endsAt === null) return null

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const warning = remaining <= 10 && remaining > 0
  const expired = remaining === 0

  return (
    <div className={`font-mono font-black text-7xl tabular-nums text-center ${
      expired ? 'text-red-500 animate-pulse' : warning ? 'text-orange-400 animate-pulse' : 'text-white'
    }`}>
      {mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : String(secs)}
    </div>
  )
}
