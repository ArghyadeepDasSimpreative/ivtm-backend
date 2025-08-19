import mongoose from 'mongoose';

const c2m2EvaluationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrganizationUser', // or your user model
    required: true
  },
  evaluationTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'submitted'],
    default: 'draft',
    required: true
  },
  // Optional: keep a running average score
  averageScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export const C2m2Evaluation = mongoose.model('C2m2Evaluation', c2m2EvaluationSchema);
