// models/C2m2Question.js
import mongoose from 'mongoose';

const C2m2QuestionSchema = new mongoose.Schema({
  domain: { type: String, required: true },
  practice: { type: String, required: true },
  practiceText: { type: String, required: true }, // renamed "PracticeText"
  question: { type: String, default: '' },
  answer: { type: String, default: '' },
  markone: { type: Number, default: null }, // markOne renamed
  marktwo: { type: Number, default: null }  // markTwo renamed
}, { timestamps: true });

export default mongoose.model('C2m2Question', C2m2QuestionSchema);
