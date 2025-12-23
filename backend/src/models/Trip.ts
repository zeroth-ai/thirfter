import mongoose, { Schema, Document } from 'mongoose';

export interface ITrip extends Document {
  creator: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  meetingPoint?: {
    name: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  stores: {
    store: mongoose.Types.ObjectId;
    order: number;
    notes?: string;
  }[];
  participants: {
    user: mongoose.Types.ObjectId;
    status: 'invited' | 'going' | 'maybe' | 'declined';
    wishlist?: string[];  // Items they're looking for
  }[];
  sharedWishlist: string[];
  chat: {
    user: mongoose.Types.ObjectId;
    message: string;
    timestamp: Date;
  }[];
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  isPublic: boolean;  // Allow others to join
  maxParticipants?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new Schema({
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  date: { type: Date, required: true },
  startTime: { type: String },
  meetingPoint: {
    name: { type: String },
    address: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  stores: [{
    store: { type: Schema.Types.ObjectId, ref: 'Shop' },
    order: { type: Number },
    notes: { type: String },
  }],
  participants: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { 
      type: String, 
      enum: ['invited', 'going', 'maybe', 'declined'],
      default: 'invited'
    },
    wishlist: [{ type: String }],
  }],
  sharedWishlist: [{ type: String }],
  chat: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    message: { type: String },
    timestamp: { type: Date, default: Date.now },
  }],
  status: { 
    type: String, 
    enum: ['planning', 'active', 'completed', 'cancelled'],
    default: 'planning'
  },
  isPublic: { type: Boolean, default: false },
  maxParticipants: { type: Number, default: 10 },
}, {
  timestamps: true,
});

TripSchema.index({ date: 1, status: 1 });
TripSchema.index({ 'participants.user': 1 });

export default mongoose.model<ITrip>('Trip', TripSchema);

