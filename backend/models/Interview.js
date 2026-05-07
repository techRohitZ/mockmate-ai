import mongoose from 'mongoose';

const transcriptSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    aiEvaluation: { type: String },
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    domain: { type: String, required: true },
    difficulty: { type: String, required: true },
    duration: { type: String, required: true },
    finalScore: { type: Number, required: true },
    transcript: { type: [transcriptSchema], default: [] },
    evaluation: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    metrics: {
      candidateWordCount: { type: Number, default: 0 },
      aiWordCount: { type: Number, default: 0 },
      estimatedTalkTimeSec: { type: Number, default: 0 },
      estimatedAvgResponseSec: { type: Number, default: 0 },
      questionCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

interviewSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

export default mongoose.model('Interview', interviewSchema);
