import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/shared/utils/mongodb'
import { QuestionModel } from '@/shared/types/question-model'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const { id } = await params
    const body = await request.json()

    const question = await QuestionModel.findByIdAndUpdate(id, body, { new: true }).lean()
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    return NextResponse.json(question)
  } catch (error) {
    console.error('PUT /api/questions/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()

    const { id } = await params
    const question = await QuestionModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).lean()

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error('DELETE /api/questions/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 })
  }
}
