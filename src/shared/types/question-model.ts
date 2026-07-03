import mongoose, { Schema, Document } from 'mongoose'

export interface IQuestion extends Document {
  letter: string
  text: string
  answer: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  gameId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const QuestionSchema = new Schema<IQuestion>(
  {
    letter: { type: String, required: true, index: true },
    text: { type: String, required: true },
    answer: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    category: { type: String, default: 'general' },
    gameId: { type: String, required: true, default: 'horouf', index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

QuestionSchema.index({ gameId: 1, letter: 1, isActive: 1 })

export const QuestionModel =
  mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema)
