import mongoose, { Schema, Document } from 'mongoose';

export interface IChallenge extends Document {
  title: string;
  description: string;
  type: 'budget' | 'category' | 'creative' | 'weekly' | 'community';
  rules: string[];
  // Challenge criteria
  criteria: {
    maxBudget?: number;        // "₹500 outfit challenge"
    requiredItems?: string[];  // "must include denim"
    theme?: string;            // "90s vibes"
    minItems?: number;
    maxItems?: number;
  };
  // Rewards
  rewards: {
    xp: number;
    badge?: string;
    title?: string;
  };
  // Timing
  startDate: Date;
  endDate: Date;
  // Submissions
  submissions: {
    user: mongoose.Types.ObjectId;
    haul: mongoose.Types.ObjectId;
    submittedAt: Date;
    votes: number;
    isWinner?: boolean;
  }[];
  // Stats
  participantCount: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
}

const ChallengeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['budget', 'category', 'creative', 'weekly', 'community'],
    required: true 
  },
  rules: [{ type: String }],
  criteria: {
    maxBudget: { type: Number },
    requiredItems: [{ type: String }],
    theme: { type: String },
    minItems: { type: Number },
    maxItems: { type: Number },
  },
  rewards: {
    xp: { type: Number, default: 100 },
    badge: { type: String },
    title: { type: String },
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  submissions: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    haul: { type: Schema.Types.ObjectId, ref: 'Haul' },
    submittedAt: { type: Date, default: Date.now },
    votes: { type: Number, default: 0 },
    isWinner: { type: Boolean, default: false },
  }],
  participantCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
}, {
  timestamps: true,
});

ChallengeSchema.index({ isActive: 1, endDate: 1 });
ChallengeSchema.index({ isFeatured: 1 });

export default mongoose.model<IChallenge>('Challenge', ChallengeSchema);

