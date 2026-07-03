'use client'

import type { Team } from '../types'

interface Props {
  winner: 1 | 2
  teams: { 1: Team; 2: Team }
}

const COLORS: Record<1 | 2, string> = { 1: 'text-orange-400', 2: 'text-blue-400' }

export default function WinnerCard({ winner, teams }: Props) {
  return (
    <div className="text-center">
      <p className="text-zinc-500 text-xl mb-3">الفائز</p>
      <p className={`text-6xl font-bold mb-2 ${COLORS[winner]} animate-bounce-in`}>
        {teams[winner].name}
      </p>
      <p className={`text-8xl font-bold mb-8 ${COLORS[winner]} animate-bounce-in`}>
        {teams[winner].score}
      </p>
      <div className="flex justify-center gap-16 text-3xl font-bold">
        <div className="text-center">
          <p className="text-orange-400">{teams[1].score}</p>
          <p className="text-zinc-500 text-base mt-1">{teams[1].name}</p>
        </div>
        <div className="text-center">
          <p className="text-blue-400">{teams[2].score}</p>
          <p className="text-zinc-500 text-base mt-1">{teams[2].name}</p>
        </div>
      </div>
    </div>
  )
}
