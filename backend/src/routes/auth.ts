import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Helper to generate JWT
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Helper to parse onboarding answers into preferences
const parseOnboardingAnswers = (answers: Record<string, unknown>) => {
  const preferences: Record<string, unknown> = {};

  if (answers.style) {
    preferences.style = answers.style;
  }

  if (answers.budget) {
    const budgetMap: Record<string, { min: number; max: number }> = {
      "budget-low": { min: 0, max: 500 },
      "budget-mid": { min: 500, max: 1500 },
      "budget-high": { min: 1500, max: 3000 },
      "budget-premium": { min: 3000, max: 10000 },
    };
    preferences.budget = {
      ...budgetMap[answers.budget as string],
      currency: "INR",
    };
  }

  if (answers.categories) {
    preferences.favoriteCategories = answers.categories;
  }

  if (answers["sizes-tops"]) {
    preferences.sizes = {
      tops: answers["sizes-tops"],
      bottoms: answers["sizes-bottoms"] || "",
      shoes: "",
    };
  }

  if (answers.locations) {
    preferences.favoriteLocations = answers.locations;
  }

  if (answers.frequency) {
    preferences.shoppingFrequency = answers.frequency;
  }

  if (answers.sustainability) {
    preferences.sustainabilityImportance = answers.sustainability;
  }

  if (answers["vintage-preference"]) {
    preferences.vintagePreference = answers["vintage-preference"];
  }

  if (answers["brand-preference"]) {
    preferences.brandPreference = answers["brand-preference"];
  }

  return preferences;
};

// Register
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }),
    body("name").trim().notEmpty(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg,
        });
      }

      const { email, password, name, onboardingAnswers } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: "Email already registered",
        });
      }

      // Parse onboarding answers into preferences
      const preferences = onboardingAnswers
        ? parseOnboardingAnswers(onboardingAnswers)
        : {};

      // Create user
      const user = await User.create({
        email,
        password,
        name,
        preferences,
        onboardingCompleted: !!onboardingAnswers,
      });

      // Generate token
      const token = generateToken(user._id.toString());

      res.status(201).json({
        success: true,
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create account",
      });
    }
  }
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Invalid credentials",
        });
      }

      const { email, password } = req.body;

      // Find user with password
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
        });
      }

      // Generate token
      const token = generateToken(user._id.toString());

      // Remove password from response
      const userObj = user.toJSON();

      res.json({
        success: true,
        data: {
          user: userObj,
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        error: "Login failed",
      });
    }
  }
);

// Get current user
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user",
    });
  }
});

// Update profile
router.put("/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, avatar },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
    });
  }
});

// Update preferences
router.put("/preferences", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { preferences: req.body },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update preferences",
    });
  }
});

export default router;

