import mongoose, { Schema, Document } from 'mongoose';

// Store insider tips from users
export interface ITip extends Document {
  user: mongoose.Types.ObjectId;
  store: mongoose.Types.ObjectId;
  type: 'insider' | 'timing' | 'haggling' | 'hidden_gem' | 'warning';
  title: string;
  content: string;
  // Specific tip data
  data?: {
    restockDay?: string;        // "Thursdays"
    bestTime?: string;          // "Weekday mornings"
    hagglePercent?: number;     // "Usually 20% off"
    secretSpot?: string;        // "Ask for back room"
  };
  // Verification
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  verifiedBy: mongoose.Types.ObjectId[];
  isVerified: boolean;
  // Moderation
  reports: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TipSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  store: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
  type: { 
    type: String, 
    enum: ['insider', 'timing', 'haggling', 'hidden_gem', 'warning'],
    required: true 
  },
  title: { type: String, required: true, maxlength: 100 },
  content: { type: String, required: true, maxlength: 500 },
  data: {
    restockDay: { type: String },
    bestTime: { type: String },
    hagglePercent: { type: Number },
    secretSpot: { type: String },
  },
  upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  verifiedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isVerified: { type: Boolean, default: false },
  reports: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Auto-verify if enough upvotes
TipSchema.pre('save', function(next) {
  if (this.upvotes.length >= 5 && this.downvotes.length < this.upvotes.length / 2) {
    this.isVerified = true;
  }
  next();
});

TipSchema.index({ store: 1, type: 1, isApproved: 1 });

export default mongoose.model<ITip>('Tip', TipSchema);

