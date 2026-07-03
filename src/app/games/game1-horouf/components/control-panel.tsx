'use client'

import type { HexCell, Question, TeamId, TeamConfig } from '../types'
import QuestionCard from './question-card'
import TeamScoreBar from './team-score-bar'

const ROUND_ORDINALS: Record<number, string> = {
  1: 'الأولى', 2: 'الثانية', 3: 'الثالثة', 4: 'الرابعة', 5: 'الخامسة',
}

interface ControlPanelProps {
  roundNumber: number
  currentCell: HexCell | null
  currentQuestion: Question | null
  isLoadingQuestion: boolean
  showAnswer: boolean
  teams: [TeamConfig, TeamConfig]
  onShowAnswer: () => void
  onNewQuestion: () => void
  onAwardPoint: (teamId: TeamId) => void
}

export default function ControlPanel({
  roundNumber,
  currentCell,
  currentQuestion,
  isLoadingQuestion,
  showAnswer,
  teams,
  onShowAnswer,
  onNewQuestion,
  onAwardPoint,
}: ControlPanelProps) {
  const ordinal = ROUND_ORDINALS[roundNumber] ?? String(roundNumber)
  const isEnabled = currentCell !== null

  return (
    <div className="flex flex-col h-full p-6 gap-6 bg-[#0F0F1A] border-l border-[#3A3F5C]">
      <div>
        <p className="text-text-muted text-sm">الجولة</p>
        <h2 className="text-xl font-bold text-text-primary">{ordinal}</h2>
      </div>

      <div className="flex-1 min-h-0">
        <QuestionCard
          currentCell={currentCell}
          currentQuestion={currentQuestion}
          isLoadingQuestion={isLoadingQuestion}
          showAnswer={showAnswer}
          onShowAnswer={onShowAnswer}
          onNewQuestion={onNewQuestion}
        />
      </div>

      <div className="space-y-3">
        {teams.map((team) => (
          <TeamScoreBar
            key={team.id}
            team={team}
            isEnabled={isEnabled}
            onAward={() => onAwardPoint(team.id)}
          />
        ))}
      </div>
    </div>
  )
}
