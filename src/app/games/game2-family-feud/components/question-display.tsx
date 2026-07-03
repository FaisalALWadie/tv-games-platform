'use client'

interface Props {
  text: string
  questionNumber: number
  total: number
}

export default function QuestionDisplay({ text, questionNumber, total }: Props) {
  return (
    <div className="bg-indigo-900 border border-indigo-700 rounded-3xl p-8 text-center mb-6">
      <p className="text-indigo-300 text-sm mb-2 tracking-widest uppercase">
        سؤال {questionNumber} / {total}
      </p>
      <p className="text-4xl font-bold text-white leading-relaxed" dir="rtl">
        {text}
      </p>
    </div>
  )
}
