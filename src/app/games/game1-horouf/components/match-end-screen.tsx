'use client'

import { useEffect } from 'react'
import type { HoroufGameState } from '../types'
import { playMatchWinSound } from '../utils/sounds'
import Confetti from './confetti'

function toArabicIndic(n: number): string {
  return n.toString().replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)])
}

function TrophyIcon() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <path
        d="M22 8h28v24a14 14 0 01-28 0V8z"
        fill="#E8A838"
        fillOpacity="0.2"
        stroke="#E8A838"
        strokeWidth="1.5"
      />
      <path d="M22 16H12a8 8 0 008 8" stroke="#E8A838" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M50 16h10a8 8 0 01-8 8" stroke="#E8A838" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M36 46v10" stroke="#E8A838" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M24 56h24" stroke="#E8A838" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 64h16" stroke="#E8A838" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

interface MatchEndScreenProps {
  gameState: HoroufGameState
  onPlayAgain: () => void
  onGoHome: () => void
}

export default function MatchEndScreen({ gameState, onPlayAgain, onGoHome }: MatchEndScreenProps) {
  const { teams, currentRound } = gameState
  const winner = teams.find((t) => t.id === currentRound?.winner)

  useEffect(() => {
    playMatchWinSound()
  }, [])

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-10">

      {/* Background pulse in winner's color */}
      {winner && (
        <div
          className="fixed inset-0 pointer-events-none animate-bg-pulse"
          style={{ background: `radial-gradient(ellipse at center, ${winner.color} 0%, transparent 70%)` }}
        />
      )}

      {/* Confetti */}
      <Confetti
        team1Color={teams[0].color}
        team2Color={teams[1].color}
      />

      {/* Trophy */}
      <div className="animate-bounce-in">
        <TrophyIcon />
      </div>

      {/* Champion banner */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-text-muted text-base animate-fade-in-up [animation-delay:500ms]">بطل المباراة</p>
        {winner && (
          <>
            <p
              className="text-5xl font-bold animate-scale-fade-in [animation-delay:800ms]"
              style={{ color: winner.color }}
            >
              {winner.name}
            </p>
            <div
              className="mt-2 w-24 h-1 rounded-full animate-fade-in-up [animation-delay:800ms]"
              style={{ backgroundColor: winner.color }}
            />
          </>
        )}
      </div>

      {/* Final scores */}
      <div className="flex gap-20 animate-fade-in-up [animation-delay:1100ms]">
        {teams.map((team) => (
          <div key={team.id} className="flex flex-col items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }} />
            <span className="text-text-secondary text-sm">{team.name}</span>
            <span className="text-6xl font-bold" style={{ color: team.color }}>
              {toArabicIndic(team.score)}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 mt-4 animate-fade-in-up [animation-delay:1400ms]">
        <button
          className="px-12 py-4 rounded-xl text-lg font-bold bg-accent-primary text-bg-primary hover:bg-accent-hover transition-colors"
          onClick={onPlayAgain}
        >
          لعب مرة أخرى
        </button>
        <button
          className="px-12 py-4 rounded-xl text-lg font-bold bg-transparent border border-border-default text-text-primary hover:border-border-hover hover:bg-bg-tertiary transition-colors"
          onClick={onGoHome}
        >
          العودة للرئيسية
        </button>
      </div>

    </div>
  )
}
