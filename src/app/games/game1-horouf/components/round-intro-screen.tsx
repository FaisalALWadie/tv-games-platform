'use client'

import { useState, useEffect } from 'react'
import type { HoroufGameState } from '../types'
import { playRoundStartSound } from '../utils/sounds'

const ROUND_ORDINALS: Record<number, string> = {
  1: 'الأولى',
  2: 'الثانية',
  3: 'الثالثة',
  4: 'الرابعة',
  5: 'الخامسة',
}

interface RoundIntroScreenProps {
  gameState: HoroufGameState
  onStart: () => void
}

export default function RoundIntroScreen({ gameState, onStart }: RoundIntroScreenProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    playRoundStartSound()
  }, [])

  const nextRoundNumber = (gameState.currentRound?.roundNumber ?? 0) + 1
  const ordinal = ROUND_ORDINALS[nextRoundNumber] ?? String(nextRoundNumber)
  const showScores = gameState.currentRound !== null
  const [team1, team2] = gameState.teams

  return (
    <div
      className={`min-h-screen bg-bg-primary flex flex-col items-center justify-center p-8 transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="text-center space-y-10">

        <div className="animate-scale-fade-in">
          <p className="text-text-secondary text-lg mb-2">الجولة</p>
          <h1 className="text-6xl font-bold text-text-primary">{ordinal}</h1>
        </div>

        {showScores && (
          <div className="flex items-center gap-12 animate-fade-in-up [animation-delay:600ms]">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: team1.color }}
                />
                <span className="text-text-secondary text-sm">{team1.name}</span>
              </div>
              <div className="text-5xl font-bold text-text-primary">{team1.score}</div>
            </div>

            <div className="text-text-muted text-3xl font-light">—</div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: team2.color }}
                />
                <span className="text-text-secondary text-sm">{team2.name}</span>
              </div>
              <div className="text-5xl font-bold text-text-primary">{team2.score}</div>
            </div>
          </div>
        )}

        <button
          onClick={onStart}
          className="bg-accent-primary text-bg-primary font-semibold px-10 py-4 rounded-lg hover:bg-accent-hover transition-colors text-lg animate-fade-in-up [animation-delay:900ms]"
        >
          ابدأ الجولة
        </button>

      </div>
    </div>
  )
}
