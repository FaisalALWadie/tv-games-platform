'use client'

import { useEffect } from 'react'
import type { HoroufGameState } from '../types'
import { playRoundWinSound } from '../utils/sounds'

function toArabicIndic(n: number): string {
  return n.toString().replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)])
}

const ROUND_ORDINALS: Record<number, string> = {
  1: 'الأولى',
  2: 'الثانية',
  3: 'الثالثة',
  4: 'الرابعة',
  5: 'الخامسة',
}

interface RoundEndScreenProps {
  gameState: HoroufGameState
  onNextRound: () => void
}

export default function RoundEndScreen({ gameState, onNextRound }: RoundEndScreenProps) {
  const { teams, currentRound } = gameState
  const winner = teams.find((t) => t.id === currentRound?.winner)
  const roundNumber = currentRound?.roundNumber ?? 1
  const ordinal = ROUND_ORDINALS[roundNumber] ?? toArabicIndic(roundNumber)

  useEffect(() => {
    playRoundWinSound()
  }, [])

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-10">

      {/* Winner announcement */}
      <div className="flex flex-col items-center gap-4">
        <p className="text-text-muted text-sm animate-fade-in-up [animation-delay:400ms]">الجولة {ordinal}</p>
        <p className="text-text-secondary text-lg animate-fade-in-up [animation-delay:400ms]">انتهت الجولة</p>
        {winner && (
          <p className="text-4xl font-bold animate-scale-fade-in" style={{ color: winner.color }}>
            {winner.name}
          </p>
        )}
        <p className="text-text-secondary text-xl animate-fade-in-up [animation-delay:400ms]">فاز بهذه الجولة</p>
      </div>

      {/* Score display */}
      <div className="flex gap-16 animate-fade-in-up [animation-delay:700ms]">
        {teams.map((team) => (
          <div key={team.id} className="flex flex-col items-center gap-2">
            <span className="text-text-secondary text-sm">{team.name}</span>
            <span className="text-5xl font-bold" style={{ color: team.color }}>
              {toArabicIndic(team.score)}
            </span>
          </div>
        ))}
      </div>

      {/* Next round button */}
      <button
        className="mt-4 px-10 py-4 rounded-xl text-lg font-bold bg-bg-surface text-text-primary border border-border-default hover:border-border-hover transition-colors animate-fade-in-up [animation-delay:1000ms]"
        onClick={onNextRound}
      >
        الجولة التالية
      </button>

    </div>
  )
}
