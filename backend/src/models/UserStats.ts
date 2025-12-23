import mongoose, { Schema, Document } from 'mongoose';

// User statistics, achievements, and gamification
export interface IUserStats extends Document {
  user: mongoose.Types.ObjectId;
  
  // Spending & Savings
  totalSpent: number;
  totalSaved: number;
  monthlyBudget?: number;
  monthlySpent: number;
  
  // Impact (Sustainability)
  impact: {
    itemsThrifted: number;
    textileWasteSaved: number;    // in kg
    waterSaved: number;           // in liters
    co2Saved: number;             // in kg
  };
  
  // Activity
  storesVisited: mongoose.Types.ObjectId[];
  haulsPosted: number;
  tipsShared: number;
  challengesCompleted: number;
  tripsJoined: number;
  
  // Gamification
  xp: number;
  level: number;
  badges: {
    id: string;
    name: string;
    description: string;
    earnedAt: Date;
    icon: string;
  }[];
  titles: string[];
  currentTitle?: string;
  
  // Streaks
  streaks: {
    daily: number;
    weekly: number;
    lastActivity: Date;
  };
  
  // Leaderboard
  rank?: number;
  weeklyRank?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

const UserStatsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  totalSpent: { type: Number, default: 0 },
  totalSaved: { type: Number, default: 0 },
  monthlyBudget: { type: Number },
  monthlySpent: { type: Number, default: 0 },
  
  impact: {
    itemsThrifted: { type: Number, default: 0 },
    textileWasteSaved: { type: Number, default: 0 },
    waterSaved: { type: Number, default: 0 },
    co2Saved: { type: Number, default: 0 },
  },
  
  storesVisited: [{ type: Schema.Types.ObjectId, ref: 'Shop' }],
  haulsPosted: { type: Number, default: 0 },
  tipsShared: { type: Number, default: 0 },
  challengesCompleted: { type: Number, default: 0 },
  tripsJoined: { type: Number, default: 0 },
  
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{
    id: { type: String },
    name: { type: String },
    description: { type: String },
    earnedAt: { type: Date },
    icon: { type: String },
  }],
  titles: [{ type: String }],
  currentTitle: { type: String },
  
  streaks: {
    daily: { type: Number, default: 0 },
    weekly: { type: Number, default: 0 },
    lastActivity: { type: Date },
  },
  
  rank: { type: Number },
  weeklyRank: { type: Number },
}, {
  timestamps: true,
});

// Calculate level from XP
UserStatsSchema.pre('save', function(next) {
  // Level formula: level = floor(sqrt(xp / 100)) + 1
  this.level = Math.floor(Math.sqrt(this.xp / 100)) + 1;
  next();
});

UserStatsSchema.index({ xp: -1 });  // For leaderboard
UserStatsSchema.index({ 'impact.itemsThrifted': -1 });

export default mongoose.model<IUserStats>('UserStats', UserStatsSchema);

