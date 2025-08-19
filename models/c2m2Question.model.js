// models/C2m2Question.js
import mongoose from 'mongoose';

const C2m2QuestionSchema = new mongoose.Schema({
  Domain: { type: String, required: true },
  Practice: { type: String, required: true },
  PracticeText: { type: String, required: true }, // renamed "Practice Text"
  Question: { type: String, default: '' },
  Answer: { type: String, default: '' },
  markOne: { type: Number, default: null }, // MIL → markOne
  markTwo: { type: Number, default: null }  // __EMPTY → markTwo
}, { timestamps: true });

export default mongoose.model('C2m2Question', C2m2QuestionSchema);
