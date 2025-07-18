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
  answersGiven: [
    {
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
    }
  ]
}, {
  timestamps: true
});

export const NistEvaluation = mongoose.model('NistEvaluation', nistEvaluationSchema);
