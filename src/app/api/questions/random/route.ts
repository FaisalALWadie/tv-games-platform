import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/shared/utils/mongodb'
import { QuestionModel } from '@/shared/types/question-model'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = request.nextUrl
    const letter = searchParams.get('letter')
    const gameId = searchParams.get('gameId') || 'horouf'
    const excludeIdsParam = searchParams.get('excludeIds')

    if (!letter) {
      return NextResponse.json({ error: 'letter is required' }, { status: 400 })
    }

    const excludeIds = excludeIdsParam
      ? excludeIdsParam.split(',').filter(Boolean)
      : []

    const baseFilter = { gameId, letter, isActive: true }

    // Try excluding all used IDs first
    let questions = await QuestionModel.find({
      ...baseFilter,
      _id: { $nin: excludeIds },
    }).lean()

    // All questions exhausted — cycle, only excluding the last shown one
    if (questions.length === 0) {
      const lastId = excludeIds[excludeIds.length - 1]
      questions = await QuestionModel.find({
        ...baseFilter,
        ...(lastId ? { _id: { $ne: lastId } } : {}),
      }).lean()
    }

    // Truly no questions for this letter
    if (questions.length === 0) {
      const total = await QuestionModel.countDocuments(baseFilter)
      if (total === 0) {
        return NextResponse.json({ error: 'No questions found for this letter' }, { status: 404 })
      }
      // Fall back to any question
      questions = await QuestionModel.find(baseFilter).lean()
    }

    const picked = questions[Math.floor(Math.random() * questions.length)]
    return NextResponse.json(picked)
  } catch (error) {
    console.error('GET /api/questions/random error:', error)
    return NextResponse.json({ error: 'Failed to fetch random question' }, { status: 500 })
  }
}
