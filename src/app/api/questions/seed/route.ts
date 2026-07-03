import { NextResponse } from 'next/server'
import { seedQuestions } from '@/app/games/game1-horouf/utils/seed-questions'

export async function POST() {
  try {
    const inserted = await seedQuestions()
    return NextResponse.json({ success: true, inserted })
  } catch (error) {
    console.error('POST /api/questions/seed error:', error)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}
