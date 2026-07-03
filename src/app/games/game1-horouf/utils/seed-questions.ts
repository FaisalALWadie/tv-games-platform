import { connectToDatabase } from '@/shared/utils/mongodb'
import { QuestionModel } from '@/shared/types/question-model'
import { QUESTION_BANK } from './questions'

export async function seedQuestions(): Promise<number> {
  await connectToDatabase()

  const docs: Array<{
    letter: string
    text: string
    answer: string
    difficulty: 'medium'
    category: string
    gameId: string
    isActive: boolean
  }> = []

  for (const [letter, questions] of Object.entries(QUESTION_BANK)) {
    for (const q of questions) {
      docs.push({
        letter,
        text: q.text,
        answer: q.answer,
        difficulty: 'medium',
        category: 'general',
        gameId: 'horouf',
        isActive: true,
      })
    }
  }

  const existingTexts = new Set(
    (await QuestionModel.find({ gameId: 'horouf' }, 'text').lean()).map((q) => q.text)
  )

  const newDocs = docs.filter((d) => !existingTexts.has(d.text))

  if (newDocs.length > 0) {
    await QuestionModel.insertMany(newDocs)
  }

  return newDocs.length
}
