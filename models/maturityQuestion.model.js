import mongoose from 'mongoose';

const MaturityQuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: [array => array.length > 0, 'At least one option is required'],
  },
  isInitial: {
    type: Boolean,
    default: false,
  },
  domain: {
    type: String,
    enum: ['Govern', 'Identify', 'Protect', 'Detect', 'Respond', 'Recover'],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export const MaturityQuestion = mongoose.model('MaturityQuestion', MaturityQuestionSchema);
