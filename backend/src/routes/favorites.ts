import { Router, Response } from "express";
import User from "../models/User.js";
import Shop from "../models/Shop.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all favorites
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).populate("favorites");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    
    res.json({
      success: true,
      data: user.favorites,
    });
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get favorites",
    });
  }
});

// Add to favorites
router.post("/:shopId", async (req: AuthRequest, res: Response) => {
  try {
    const { shopId } = req.params;
    
    // Verify shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        error: "Shop not found",
      });
    }
    
    // Add to favorites (using $addToSet to prevent duplicates)
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { favorites: shopId } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    
    res.json({
      success: true,
      message: "Added to favorites",
    });
  } catch (error) {
    console.error("Add favorite error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add to favorites",
    });
  }
});

// Remove from favorites
router.delete("/:shopId", async (req: AuthRequest, res: Response) => {
  try {
    const { shopId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { favorites: shopId } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    
    res.json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error) {
    console.error("Remove favorite error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove from favorites",
    });
  }
});

// Check if shop is favorited
router.get("/check/:shopId", async (req: AuthRequest, res: Response) => {
  try {
    const { shopId } = req.params;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    
    const isFavorited = user.favorites.some(
      (fav) => fav.toString() === shopId
    );
    
    res.json({
      success: true,
      data: { isFavorited },
    });
  } catch (error) {
    console.error("Check favorite error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check favorite status",
    });
  }
});

export default router;

