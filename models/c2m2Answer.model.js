import mongoose from "mongoose";

const C2m2AnswerSchema = new mongoose.Schema({
  evaluationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "C2m2Evaluation",
    required: true 
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "C2m2Question",
    required: true
  },
  primary: { type: String, default: "No" }, // e.g. Yes/No
  followUp: { type: String, default: "" },
  marks: { type: Number, default: 0 },
  domain: { type: String, required: true },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }
}, { timestamps: true });

export default mongoose.model("C2m2Answer", C2m2AnswerSchema);
