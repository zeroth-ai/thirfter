import mongoose, { Schema, Document } from 'mongoose';

// Individual item in a haul
interface IHaulItem {
  name: string;
  price: number;
  retailPrice?: number;
  store: mongoose.Types.ObjectId;
  image?: string;
  category?: string;
  size?: string;
}

export interface IHaul extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  items: IHaulItem[];
  totalSpent: number;
  totalSaved: number;
  images: string[];
  likes: mongoose.Types.ObjectId[];
  comments: {
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HaulItemSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  retailPrice: { type: Number },
  store: { type: Schema.Types.ObjectId, ref: 'Shop' },
  image: { type: String },
  category: { type: String },
  size: { type: String },
});

const HaulSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  items: [HaulItemSchema],
  totalSpent: { type: Number, default: 0 },
  totalSaved: { type: Number, default: 0 },
  images: [{ type: String }],
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, maxlength: 300 },
    createdAt: { type: Date, default: Date.now },
  }],
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: true },
}, {
  timestamps: true,
});

// Calculate totals before saving
HaulSchema.pre('save', function(next) {
  this.totalSpent = this.items.reduce((sum, item) => sum + item.price, 0);
  this.totalSaved = this.items.reduce((sum, item) => {
    return sum + ((item.retailPrice || item.price * 3) - item.price);
  }, 0);
  next();
});

// Index for feed queries
HaulSchema.index({ createdAt: -1, isPublic: 1 });
HaulSchema.index({ likes: 1 });

export default mongoose.model<IHaul>('Haul', HaulSchema);

