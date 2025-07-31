import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HipaaQuestion',
      required: true,
    },
    questionAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const hipaaEvaluationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timeTaken: {
      type: Date,
      required: true,
      default: Date.now,
    },
    answers: {
      type: [answerSchema],
      required: true,
      validate: {
        validator: (val) => Array.isArray(val) && val.length > 0,
        message: 'At least one answer is required.',
      },
    },
  },
  {
    timestamps: true,
  }
);

const HipaaEvaluation = mongoose.model('HipaaEvaluation', hipaaEvaluationSchema);

export default HipaaEvaluation;
