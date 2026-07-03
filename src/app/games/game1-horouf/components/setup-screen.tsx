'use client'

import { useState } from 'react'
import type { HoroufSettings, GridSize, RoundsToWin } from '../types'

const TEAM_COLORS = [
  '#34D399', '#F87171', '#60A5FA', '#A78BFA',
  '#F59E0B', '#EC4899', '#14B8A6', '#F97316',
]

const GRID_SIZES: GridSize[] = [4, 5, 6]
const ROUNDS_OPTIONS: RoundsToWin[] = [1, 2, 3]
const ROUNDS_LABELS: Record<RoundsToWin, string> = {
  1: 'جولة واحدة',
  2: 'أفضل من 3',
  3: 'أفضل من 5',
}

interface SetupScreenProps {
  onStart: (settings: HoroufSettings) => void
}

export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [hostName, setHostName] = useState('')
  const [team1Name, setTeam1Name] = useState('')
  const [team2Name, setTeam2Name] = useState('')
  const [gridSize, setGridSize] = useState<GridSize>(5)
  const [roundsToWin, setRoundsToWin] = useState<RoundsToWin>(2)
  const [team1Color, setTeam1Color] = useState('#34D399')
  const [team2Color, setTeam2Color] = useState('#F87171')

  function handleStart(): void {
    if (!hostName.trim()) return
    onStart({ gridSize, roundsToWin, hostName: hostName.trim(), team1Name: team1Name.trim(), team2Name: team2Name.trim(), team1Color, team2Color })
  }

  const title = hostName.trim() ? `حروف مع ${hostName.trim()}` : 'حروف'

  const teamRows = [
    { key: 'team1', nameLabel: 'اسم الفريق الأول', namePlaceholder: 'الفريق الأول', nameValue: team1Name, setName: setTeam1Name, colorLabel: 'لون الفريق الأول', color: team1Color, conflict: team2Color, setColor: setTeam1Color },
    { key: 'team2', nameLabel: 'اسم الفريق الثاني', namePlaceholder: 'الفريق الثاني', nameValue: team2Name, setName: setTeam2Name, colorLabel: 'لون الفريق الثاني', color: team2Color, conflict: team1Color, setColor: setTeam2Color },
  ]

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-8">

        <div className="text-center">
          <div className="flex justify-center mb-4">
            <svg width="60" height="40" viewBox="0 0 60 40" fill="none" aria-hidden="true">
              {/* Top center hex */}
              <polygon points="30,2 38.7,7 38.7,17 30,22 21.3,17 21.3,7" fill="#E8A838" fillOpacity="0.2" />
              {/* Bottom left hex */}
              <polygon points="21.3,17 30,22 30,32 21.3,37 12.7,32 12.7,22" fill="#E8A838" fillOpacity="0.2" />
              {/* Bottom right hex */}
              <polygon points="38.7,17 47.3,22 47.3,32 38.7,37 30,32 30,22" fill="#E8A838" fillOpacity="0.2" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-text-primary">{title}</h1>
          <p className="text-text-secondary mt-2">إعداد اللعبة</p>
        </div>

        <div className="space-y-2">
          <label className="text-text-primary font-semibold block">اسم المقدم</label>
          <input
            type="text"
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            placeholder="أدخل اسم المقدم"
            className="bg-bg-surface border border-border-default rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none transition-colors w-full text-right"
          />
        </div>

        <div className="space-y-2">
          <label className="text-text-primary font-semibold block">حجم الشبكة</label>
          <div className="flex gap-2">
            {GRID_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setGridSize(size)}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  gridSize === size
                    ? 'bg-accent-primary text-bg-primary'
                    : 'bg-bg-surface border border-border-default text-text-secondary hover:border-border-hover hover:text-text-primary'
                }`}
              >
                {size}×{size}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-text-primary font-semibold block">جولات الفوز</label>
          <div className="flex gap-2">
            {ROUNDS_OPTIONS.map((rounds) => (
              <button
                key={rounds}
                onClick={() => setRoundsToWin(rounds)}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  roundsToWin === rounds
                    ? 'bg-accent-primary text-bg-primary'
                    : 'bg-bg-surface border border-border-default text-text-secondary hover:border-border-hover hover:text-text-primary'
                }`}
              >
                {ROUNDS_LABELS[rounds]}
              </button>
            ))}
          </div>
        </div>

        {teamRows.map(({ key, nameLabel, namePlaceholder, nameValue, setName, colorLabel, color, conflict, setColor }) => (
          <div key={key} className="space-y-2">
            <label className="text-text-primary font-semibold block">{nameLabel}</label>
            <input
              type="text"
              value={nameValue}
              onChange={(e) => setName(e.target.value)}
              placeholder={namePlaceholder}
              className="bg-bg-surface border border-border-default rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none transition-colors w-full text-right"
            />
            <label className="text-text-primary font-semibold block">{colorLabel}</label>
            <div className="flex gap-3 flex-wrap">
              {TEAM_COLORS.map((swatch) => {
                const isSelected = color === swatch
                const isConflict = conflict === swatch
                return (
                  <button
                    key={swatch}
                    disabled={isConflict}
                    onClick={() => setColor(swatch)}
                    aria-label={swatch}
                    className={`w-9 h-9 rounded-full transition-all ${
                      isConflict
                        ? 'opacity-30 cursor-not-allowed'
                        : isSelected
                        ? 'ring-2 ring-white scale-110'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: swatch }}
                  />
                )
              })}
            </div>
          </div>
        ))}

        <button
          onClick={handleStart}
          disabled={!hostName.trim()}
          className="w-full bg-accent-primary text-bg-primary font-semibold px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ابدأ اللعبة
        </button>

      </div>
    </div>
  )
}
