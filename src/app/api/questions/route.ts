import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/shared/utils/mongodb'
import { QuestionModel } from '@/shared/types/question-model'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = request.nextUrl
    const letter = searchParams.get('letter')
    const gameId = searchParams.get('gameId') || 'horouf'
    const difficulty = searchParams.get('difficulty')

    const filter: Record<string, unknown> = { gameId, isActive: true }
    if (letter) filter.letter = letter
    if (difficulty) filter.difficulty = difficulty

    const questions = await QuestionModel.find(filter).lean()
    return NextResponse.json(questions)
  } catch (error) {
    console.error('GET /api/questions error:', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { letter, text, answer, difficulty, category, gameId } = body

    if (!letter || !text || !answer) {
      return NextResponse.json({ error: 'letter, text, and answer are required' }, { status: 400 })
    }

    const question = await QuestionModel.create({
      letter,
      text,
      answer,
      difficulty: difficulty || 'medium',
      category: category || 'general',
      gameId: gameId || 'horouf',
      isActive: true,
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error('POST /api/questions error:', error)
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 })
  }
}
