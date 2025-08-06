import mongoose from 'mongoose';

const nistAnswerSchema = new mongoose.Schema({
  evaluationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NistEvaluation',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  marks: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  functionName: {
    type: String,
    enum: ['IDENTIFY', 'PROTECT', 'DETECT', 'RESPOND', 'RECOVER', 'GOVERN'],
    required: true
  }
}, {
  timestamps: true
});

export const NistAnswer = mongoose.model('NistAnswer', nistAnswerSchema);
