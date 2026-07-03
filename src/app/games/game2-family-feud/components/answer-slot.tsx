'use client'

import type { Answer } from '../types'

interface Props {
  answer: Answer
  rank: number
  animateReveal?: boolean
}

export default function AnswerSlot({ answer, rank, animateReveal }: Props) {
  return (
    <div
      className={`flex items-center gap-4 bg-zinc-800 border rounded-xl px-5 py-4 ${
        answer.revealed ? 'border-yellow-500' : 'border-zinc-700'
      } ${animateReveal && answer.revealed ? 'animate-reveal' : ''}`}
    >
      <span className="text-zinc-500 font-bold text-lg w-6 text-center">{rank}</span>
      <div className="flex-1">
        {answer.revealed ? (
          <span className="text-white text-xl font-bold">{answer.text}</span>
        ) : (
          <span className="text-zinc-600 text-xl">_ _ _ _ _</span>
        )}
      </div>
      {answer.revealed && (
        <span className="text-yellow-400 font-bold text-xl">{answer.points}</span>
      )}
    </div>
  )
}
