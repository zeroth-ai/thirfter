import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  user: mongoose.Types.ObjectId;
  type: 'price_drop' | 'restock' | 'new_store' | 'flash_sale' | 'size_available';
  // Alert criteria
  criteria: {
    query?: string;           // "vintage denim jacket"
    maxPrice?: number;        // under ₹500
    stores?: mongoose.Types.ObjectId[];
    locations?: string[];
    categories?: string[];
    sizes?: string[];
    tags?: string[];
  };
  // Notification settings
  notifyVia: ('push' | 'email' | 'sms')[];
  frequency: 'instant' | 'daily' | 'weekly';
  isActive: boolean;
  // Stats
  matchCount: number;
  lastTriggered?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { 
    type: String, 
    enum: ['price_drop', 'restock', 'new_store', 'flash_sale', 'size_available'],
    required: true 
  },
  criteria: {
    query: { type: String },
    maxPrice: { type: Number },
    stores: [{ type: Schema.Types.ObjectId, ref: 'Shop' }],
    locations: [{ type: String }],
    categories: [{ type: String }],
    sizes: [{ type: String }],
    tags: [{ type: String }],
  },
  notifyVia: [{ 
    type: String, 
    enum: ['push', 'email', 'sms'],
    default: ['push']
  }],
  frequency: { 
    type: String, 
    enum: ['instant', 'daily', 'weekly'],
    default: 'instant'
  },
  isActive: { type: Boolean, default: true },
  matchCount: { type: Number, default: 0 },
  lastTriggered: { type: Date },
}, {
  timestamps: true,
});

AlertSchema.index({ type: 1, isActive: 1 });

export default mongoose.model<IAlert>('Alert', AlertSchema);

