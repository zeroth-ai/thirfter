import mongoose, { Schema, Document } from 'mongoose';

export interface IStyleBoard extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  coverImage?: string;
  items: {
    type: 'store_item' | 'external' | 'haul_item';
    store?: mongoose.Types.ObjectId;
    haul?: mongoose.Types.ObjectId;
    name: string;
    image: string;
    price?: number;
    link?: string;
    position?: { x: number; y: number };  // For outfit builder layout
    notes?: string;
  }[];
  tags: string[];
  style: string;  // vintage, streetwear, etc.
  totalEstimate: number;
  isPublic: boolean;
  likes: mongoose.Types.ObjectId[];
  saves: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const StyleBoardSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  coverImage: { type: String },
  items: [{
    type: { 
      type: String, 
      enum: ['store_item', 'external', 'haul_item'],
      required: true 
    },
    store: { type: Schema.Types.ObjectId, ref: 'Shop' },
    haul: { type: Schema.Types.ObjectId, ref: 'Haul' },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number },
    link: { type: String },
    position: {
      x: { type: Number },
      y: { type: Number },
    },
    notes: { type: String },
  }],
  tags: [{ type: String }],
  style: { type: String },
  totalEstimate: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  saves: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true,
});

// Calculate total estimate
StyleBoardSchema.pre('save', function(next) {
  this.totalEstimate = this.items.reduce((sum, item) => sum + (item.price || 0), 0);
  next();
});

StyleBoardSchema.index({ isPublic: 1, createdAt: -1 });
StyleBoardSchema.index({ style: 1 });

export default mongoose.model<IStyleBoard>('StyleBoard', StyleBoardSchema);

