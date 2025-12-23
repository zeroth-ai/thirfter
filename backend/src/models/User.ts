import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

// Types
export interface IUserPreferences {
  style: string[];
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  favoriteCategories: string[];
  sizes: {
    tops: string;
    bottoms: string;
    shoes: string;
  };
  favoriteLocations: string[];
  shoppingFrequency: string;
  sustainabilityImportance: number;
  vintagePreference: number;
  brandPreference: string;
  aestheticVibes: string[];
}

export interface ISearchHistoryItem {
  query: string;
  timestamp: Date;
  type: "text" | "image";
  results: number;
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  avatar?: string;
  preferences: IUserPreferences;
  searchHistory: ISearchHistoryItem[];
  favorites: mongoose.Types.ObjectId[];
  onboardingCompleted: boolean;
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schema
const userPreferencesSchema = new Schema<IUserPreferences>({
  style: { type: [String], default: [] },
  budget: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 5000 },
    currency: { type: String, default: "INR" },
  },
  favoriteCategories: { type: [String], default: [] },
  sizes: {
    tops: { type: String, default: "m" },
    bottoms: { type: String, default: "30-32" },
    shoes: { type: String, default: "" },
  },
  favoriteLocations: { type: [String], default: [] },
  shoppingFrequency: { type: String, default: "monthly" },
  sustainabilityImportance: { type: Number, default: 3, min: 1, max: 5 },
  vintagePreference: { type: Number, default: 3, min: 1, max: 5 },
  brandPreference: { type: String, default: "no-preference" },
  aestheticVibes: { type: [String], default: [] },
}, { _id: false });

const searchHistoryItemSchema = new Schema<ISearchHistoryItem>({
  query: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, enum: ["text", "image"], default: "text" },
  results: { type: Number, default: 0 },
}, { _id: false });

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't include password by default in queries
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    avatar: {
      type: String,
      default: null,
    },
    preferences: {
      type: userPreferencesSchema,
      default: () => ({}),
    },
    searchHistory: {
      type: [searchHistoryItemSchema],
      default: [],
    },
    favorites: [{
      type: Schema.Types.ObjectId,
      ref: "Shop",
    }],
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    embedding: {
      type: [Number],
      default: undefined,
      select: false, // Don't include embedding by default
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.password;
        delete ret.embedding;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ "preferences.favoriteLocations": 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to find by email with password
userSchema.statics.findByEmailWithPassword = function (email: string) {
  return this.findOne({ email }).select("+password");
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;

