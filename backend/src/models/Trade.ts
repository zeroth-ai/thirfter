import mongoose, { Schema, Document } from 'mongoose';

// For selling/trading items
export interface ITrade extends Document {
  user: mongoose.Types.ObjectId;
  type: 'sell' | 'trade' | 'iso';  // ISO = In Search Of
  title: string;
  description: string;
  // Item details (for sell/trade)
  item?: {
    name: string;
    category: string;
    size?: string;
    condition: 'new' | 'like_new' | 'good' | 'fair';
    originalStore?: mongoose.Types.ObjectId;
    originalPrice?: number;
  };
  price?: number;
  isNegotiable: boolean;
  // For trades
  lookingFor?: string[];
  // Images
  images: string[];
  // Location
  location: {
    area: string;
    canMeet: string[];  // Areas willing to meet
    canShip: boolean;
  };
  // Status
  status: 'active' | 'pending' | 'sold' | 'traded' | 'closed';
  // Interested users
  interests: {
    user: mongoose.Types.ObjectId;
    message?: string;
    createdAt: Date;
  }[];
  views: number;
  saves: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TradeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { 
    type: String, 
    enum: ['sell', 'trade', 'iso'],
    required: true 
  },
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 1000 },
  item: {
    name: { type: String },
    category: { type: String },
    size: { type: String },
    condition: { 
      type: String, 
      enum: ['new', 'like_new', 'good', 'fair']
    },
    originalStore: { type: Schema.Types.ObjectId, ref: 'Shop' },
    originalPrice: { type: Number },
  },
  price: { type: Number },
  isNegotiable: { type: Boolean, default: true },
  lookingFor: [{ type: String }],
  images: [{ type: String }],
  location: {
    area: { type: String, required: true },
    canMeet: [{ type: String }],
    canShip: { type: Boolean, default: false },
  },
  status: { 
    type: String, 
    enum: ['active', 'pending', 'sold', 'traded', 'closed'],
    default: 'active'
  },
  interests: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    message: { type: String },
    createdAt: { type: Date, default: Date.now },
  }],
  views: { type: Number, default: 0 },
  saves: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true,
});

TradeSchema.index({ type: 1, status: 1, createdAt: -1 });
TradeSchema.index({ 'location.area': 1 });

export default mongoose.model<ITrade>('Trade', TradeSchema);

