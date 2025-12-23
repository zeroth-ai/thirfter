import mongoose, { Schema, Document } from 'mongoose';

// Real-time store activity and crowd data
export interface IStoreActivity extends Document {
  store: mongoose.Types.ObjectId;
  
  // Crowd data
  crowdLevel: 'empty' | 'quiet' | 'moderate' | 'busy' | 'packed';
  crowdReports: {
    user: mongoose.Types.ObjectId;
    level: string;
    reportedAt: Date;
  }[];
  lastCrowdUpdate: Date;
  
  // Best times (aggregated)
  bestTimes: {
    day: number;  // 0-6 (Sunday-Saturday)
    hour: number; // 0-23
    crowdLevel: number; // 1-5
  }[];
  
  // Restock info
  restockInfo: {
    day?: string;
    frequency?: string;
    lastRestock?: Date;
    nextExpected?: Date;
    confidence: number;
  };
  
  // Live inventory reports
  recentSpots: {
    user: mongoose.Types.ObjectId;
    item: string;
    size?: string;
    price?: number;
    image?: string;
    spottedAt: Date;
  }[];
  
  // Student discount
  studentDiscount?: {
    percentage: number;
    details: string;
    verified: boolean;
  };
  
  // Price ranges
  priceRanges: {
    category: string;
    min: number;
    max: number;
    average: number;
  }[];
  
  // Haggling info
  hagglingInfo: {
    isAllowed: boolean;
    typicalDiscount: number;
    tips: string[];
  };
  
  updatedAt: Date;
}

const StoreActivitySchema = new Schema({
  store: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, unique: true },
  
  crowdLevel: { 
    type: String, 
    enum: ['empty', 'quiet', 'moderate', 'busy', 'packed'],
    default: 'moderate'
  },
  crowdReports: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    level: { type: String },
    reportedAt: { type: Date, default: Date.now },
  }],
  lastCrowdUpdate: { type: Date },
  
  bestTimes: [{
    day: { type: Number },
    hour: { type: Number },
    crowdLevel: { type: Number },
  }],
  
  restockInfo: {
    day: { type: String },
    frequency: { type: String },
    lastRestock: { type: Date },
    nextExpected: { type: Date },
    confidence: { type: Number, default: 0 },
  },
  
  recentSpots: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    item: { type: String },
    size: { type: String },
    price: { type: Number },
    image: { type: String },
    spottedAt: { type: Date, default: Date.now },
  }],
  
  studentDiscount: {
    percentage: { type: Number },
    details: { type: String },
    verified: { type: Boolean, default: false },
  },
  
  priceRanges: [{
    category: { type: String },
    min: { type: Number },
    max: { type: Number },
    average: { type: Number },
  }],
  
  hagglingInfo: {
    isAllowed: { type: Boolean, default: true },
    typicalDiscount: { type: Number, default: 10 },
    tips: [{ type: String }],
  },
}, {
  timestamps: true,
});

// Keep only recent crowd reports (last 24 hours)
StoreActivitySchema.pre('save', function(next) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  this.crowdReports = this.crowdReports.filter(r => r.reportedAt > oneDayAgo);
  
  // Keep only recent spots (last 7 days)
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  this.recentSpots = this.recentSpots.filter(s => s.spottedAt > oneWeekAgo);
  
  // Calculate crowd level from recent reports
  if (this.crowdReports.length > 0) {
    const levels = { empty: 1, quiet: 2, moderate: 3, busy: 4, packed: 5 };
    const avg = this.crowdReports.reduce((sum, r) => sum + (levels[r.level as keyof typeof levels] || 3), 0) / this.crowdReports.length;
    const levelNames = ['empty', 'quiet', 'moderate', 'busy', 'packed'];
    this.crowdLevel = levelNames[Math.round(avg) - 1] as any;
    this.lastCrowdUpdate = new Date();
  }
  
  next();
});

export default mongoose.model<IStoreActivity>('StoreActivity', StoreActivitySchema);

