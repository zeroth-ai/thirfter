import mongoose, { Schema, Document } from "mongoose";

// Types
export interface ILocation {
  id: string;
  label: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface IOpeningHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface IShop extends Document {
  name: string;
  slug: string;
  tag: string;
  desc: string;
  mapLink: string;
  location: ILocation;
  rating?: number;
  reviewCount?: number;
  images: string[];
  specialties: string[];
  priceRange?: string;
  openingHours?: IOpeningHours;
  bestTimeToVisit?: string;
  embedding?: number[];
  isActive: boolean;
  scrapedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const locationSchema = new Schema<ILocation>({
  id: { type: String, required: true },
  label: { type: String, required: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
}, { _id: false });

const openingHoursSchema = new Schema<IOpeningHours>({
  monday: { type: String, default: "10:00 AM - 9:00 PM" },
  tuesday: { type: String, default: "10:00 AM - 9:00 PM" },
  wednesday: { type: String, default: "10:00 AM - 9:00 PM" },
  thursday: { type: String, default: "10:00 AM - 9:00 PM" },
  friday: { type: String, default: "10:00 AM - 9:00 PM" },
  saturday: { type: String, default: "10:00 AM - 9:00 PM" },
  sunday: { type: String, default: "10:00 AM - 9:00 PM" },
}, { _id: false });

const shopSchema = new Schema<IShop>(
  {
    name: {
      type: String,
      required: [true, "Shop name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    tag: {
      type: String,
      required: [true, "Tag is required"],
      trim: true,
    },
    desc: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    mapLink: {
      type: String,
      required: [true, "Map link is required"],
    },
    location: {
      type: locationSchema,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    specialties: {
      type: [String],
      default: [],
    },
    priceRange: {
      type: String,
      enum: ["budget", "mid-range", "premium", null],
      default: null,
    },
    openingHours: {
      type: openingHoursSchema,
      default: undefined,
    },
    bestTimeToVisit: {
      type: String,
    },
    embedding: {
      type: [Number],
      default: undefined,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    scrapedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.embedding;
        return ret;
      },
    },
  }
);

// Indexes
shopSchema.index({ slug: 1 });
shopSchema.index({ "location.id": 1 });
shopSchema.index({ tag: 1 });
shopSchema.index({ rating: -1 });
shopSchema.index({ isActive: 1 });
shopSchema.index({ name: "text", desc: "text", tag: "text" });

// Generate slug before saving
shopSchema.pre("save", function (next) {
  if (!this.isModified("name") && this.slug) return next();
  
  this.slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  
  next();
});

// Virtual for full location string
shopSchema.virtual("fullLocation").get(function () {
  return this.location?.label || "";
});

const Shop = mongoose.model<IShop>("Shop", shopSchema);

export default Shop;

