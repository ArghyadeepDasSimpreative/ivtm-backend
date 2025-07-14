import mongoose from 'mongoose';

const MaturityResultSchema = new mongoose.Schema({
  ip: {
    type: String,
    required: true,
  },
  score: {
    type: Number, // Float
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  }
});

export const MaturityResult = mongoose.model('MaturityResult', MaturityResultSchema);
