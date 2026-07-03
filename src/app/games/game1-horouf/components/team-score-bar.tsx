'use client'

import { useState } from 'react'
import type { TeamConfig } from '../types'

interface TeamScoreBarProps {
  team: TeamConfig
  isEnabled: boolean
  onAward: () => void
}

export default function TeamScoreBar({ team, isEnabled, onAward }: TeamScoreBarProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onAward}
      disabled={!isEnabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
        isEnabled ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
      }`}
      style={{
        backgroundColor: team.color + (hovered && isEnabled ? '55' : '40'),
        borderColor: team.color + '80',
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-bg-primary font-bold text-sm flex-shrink-0"
        style={{ backgroundColor: team.color }}
      >
        ✓
      </div>

      <span className="flex-1 text-text-primary font-semibold text-base text-right">
        {team.name}
      </span>

      <div
        className="w-8 h-8 flex items-center justify-center font-bold text-2xl flex-shrink-0"
        style={{ color: team.color }}
      >
        {team.score}
      </div>
    </button>
  )
}
