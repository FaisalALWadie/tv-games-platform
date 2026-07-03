'use client'

import type { Team } from '../types'

interface Props {
  team: Team
  isActive?: boolean
}

const COLORS: Record<1 | 2, { border: string; text: string; activeBg: string; dot: string; lockedBg: string }> = {
  1: {
    border: 'border-orange-500',
    text: 'text-orange-400',
    activeBg: 'bg-orange-500/10',
    dot: 'bg-orange-500',
    lockedBg: 'bg-red-900/30',
  },
  2: {
    border: 'border-blue-500',
    text: 'text-blue-400',
    activeBg: 'bg-blue-500/10',
    dot: 'bg-blue-500',
    lockedBg: 'bg-red-900/30',
  },
}

export default function TeamScoreboard({ team, isActive = false }: Props) {
  const c = COLORS[team.id]

  return (
    <div
      className={`border-2 rounded-2xl p-4 text-center transition-all duration-300 ${
        team.isLockedOut
          ? `border-red-700 ${c.lockedBg}`
          : isActive
          ? `${c.border} ${c.activeBg}`
          : 'border-zinc-700 bg-zinc-900'
      }`}
    >
      <p className="text-sm text-zinc-400 mb-1 truncate">{team.name}</p>
      <p className={`text-5xl font-bold ${team.isLockedOut ? 'text-zinc-600' : c.text}`}>
        {team.score}
      </p>

      {team.isLockedOut ? (
        <p className="text-red-400 font-bold text-sm mt-2">محجوب 🔒</p>
      ) : (
        <div className="flex justify-center gap-2 mt-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full transition-colors duration-300 ${
                i <= team.mistakes ? 'bg-red-500 animate-strike-in' : 'bg-zinc-700'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
