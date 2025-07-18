import mongoose from 'mongoose';

const NIST_FUNCTIONS = ['Identify', 'Protect', 'Detect', 'Respond', 'Recover', 'Govern']; // include 'Govern' if you're using CSF 2.0

const nistQuestionSchema = new mongoose.Schema({
  function: {
    type: String,
    enum: NIST_FUNCTIONS,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    required: true,
    trim: true
  },
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: arr => Array.isArray(arr) && arr.length > 0,
      message: 'Options array must contain at least one item.'
    }
  }
}, {
  timestamps: true
});

export const NistQuestion = mongoose.model('NistQuestion', nistQuestionSchema);
