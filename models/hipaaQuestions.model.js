// models/HipaaQuestion.js
import mongoose from 'mongoose';

const hipaaQuestionSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    task: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    score: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

const HipaaQuestion = mongoose.model('HipaaQuestion', hipaaQuestionSchema);
export default HipaaQuestion;
