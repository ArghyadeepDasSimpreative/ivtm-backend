import mongoose from 'mongoose';

const nistEvaluationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrganizationUser',
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
  }
}, {
  timestamps: true
});

export const NistEvaluation = mongoose.model('NistEvaluation', nistEvaluationSchema);
