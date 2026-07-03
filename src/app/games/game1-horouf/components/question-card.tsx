'use client'

import type { HexCell, Question } from '../types'

interface QuestionCardProps {
  currentCell: HexCell | null
  currentQuestion: Question | null
  isLoadingQuestion: boolean
  showAnswer: boolean
  onShowAnswer: () => void
  onNewQuestion: () => void
}

export default function QuestionCard({
  currentCell,
  currentQuestion,
  isLoadingQuestion,
  showAnswer,
  onShowAnswer,
  onNewQuestion,
}: QuestionCardProps) {
  if (!currentCell) {
    return (
      <div className="bg-[#181830] border border-[#3A3F5C] rounded-xl p-6 flex flex-col items-center justify-center min-h-[260px] gap-4">
        <div className="w-10 h-10 rounded-xl border border-[#3A3F5C] flex items-center justify-center text-text-muted text-lg">
          ؟
        </div>
        <p className="text-text-muted text-lg text-center">اختر حرفًا لإظهار السؤال</p>
      </div>
    )
  }

  if (isLoadingQuestion) {
    return (
      <div className="bg-[#181830] border border-[#3A3F5C] rounded-xl p-6 flex flex-col items-center justify-center min-h-[260px] gap-4">
        <div className="w-12 h-12 rounded-full bg-accent-primary flex items-center justify-center text-xl font-bold text-bg-primary shadow-[0_0_16px_rgba(240,176,48,0.45)]">
          {currentCell.letter}
        </div>
        <p className="text-text-muted text-lg text-center animate-pulse">جاري تحميل السؤال...</p>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="bg-[#181830] border border-[#3A3F5C] rounded-xl p-6 flex flex-col items-center justify-center min-h-[260px] gap-4">
        <div className="w-10 h-10 rounded-xl border border-[#3A3F5C] flex items-center justify-center text-text-muted text-lg">
          ؟
        </div>
        <p className="text-text-muted text-lg text-center">اختر حرفًا لإظهار السؤال</p>
      </div>
    )
  }

  return (
    <div className="bg-[#181830] border border-[#3A3F5C] rounded-xl p-6 min-h-[260px] flex flex-col gap-4">
      <div className="flex justify-center">
        <div className="w-12 h-12 rounded-full bg-accent-primary flex items-center justify-center text-xl font-bold text-bg-primary shadow-[0_0_16px_rgba(240,176,48,0.45)]">
          {currentCell.letter}
        </div>
      </div>

      <p className="text-text-primary text-lg leading-relaxed text-right flex-1">
        {currentQuestion.text}
      </p>

      {showAnswer && (
        <p className="text-accent-primary text-xl font-bold text-right">
          {currentQuestion.answer}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          onClick={onShowAnswer}
          disabled={showAnswer}
          className="flex-1 border border-[#5A4A2A] bg-[#2A2210] text-[#E8A838] py-2 rounded-lg hover:bg-[#352A15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
        >
          عرض الإجابة
        </button>
        <button
          onClick={onNewQuestion}
          className="flex-1 border border-[#2A4A5A] bg-[#1A2A3A] text-[#60D0E8] py-2 rounded-lg hover:bg-[#203545] transition-colors text-sm font-semibold"
        >
          سؤال جديد
        </button>
      </div>
    </div>
  )
}
