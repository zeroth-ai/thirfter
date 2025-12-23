import { Router, Response } from "express";
import Shop from "../models/Shop.js";
import User from "../models/User.js";
import { optionalAuthMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

// Text search
router.get("/", async (req, res: Response) => {
  try {
    const { q, location, tags, limit = 20 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }
    
    const query: Record<string, unknown> = {
      isActive: true,
      $text: { $search: q as string },
    };
    
    if (location) {
      query["location.id"] = location;
    }
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tag = { $in: tagArray };
    }
    
    const shops = await Shop.find(
      query,
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(Number(limit));
    
    res.json({
      success: true,
      data: {
        shops,
        totalCount: shops.length,
        query: q,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      error: "Search failed",
    });
  }
});

// Get search suggestions
router.get("/suggestions", async (req, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || (q as string).length < 2) {
      return res.json({
        success: true,
        data: [],
      });
    }
    
    // Get matching shop names and tags
    const shops = await Shop.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: "i" } },
        { tag: { $regex: q, $options: "i" } },
        { "location.label": { $regex: q, $options: "i" } },
      ],
    })
      .select("name tag location.label")
      .limit(10);
    
    // Generate suggestions
    const suggestions = new Set<string>();
    
    shops.forEach((shop) => {
      if (shop.name.toLowerCase().includes((q as string).toLowerCase())) {
        suggestions.add(shop.name);
      }
      if (shop.tag.toLowerCase().includes((q as string).toLowerCase())) {
        suggestions.add(`${shop.tag} stores`);
      }
      if (shop.location.label.toLowerCase().includes((q as string).toLowerCase())) {
        suggestions.add(`Stores in ${shop.location.label}`);
      }
    });
    
    // Add common search terms
    const commonTerms = [
      "vintage jackets",
      "cheap denim",
      "streetwear",
      "y2k aesthetic",
      "winter wear",
      "leather jackets",
      "surplus stores",
      "thrift stores",
    ];
    
    commonTerms.forEach((term) => {
      if (term.toLowerCase().includes((q as string).toLowerCase())) {
        suggestions.add(term);
      }
    });
    
    res.json({
      success: true,
      data: Array.from(suggestions).slice(0, 8),
    });
  } catch (error) {
    console.error("Suggestions error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get suggestions",
    });
  }
});

// Add to search history (authenticated)
router.post("/history", optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.json({ success: true });
    }
    
    const { query, type = "text", results = 0 } = req.body;
    
    await User.findByIdAndUpdate(req.userId, {
      $push: {
        searchHistory: {
          $each: [{ query, type, results, timestamp: new Date() }],
          $slice: -50, // Keep last 50 searches
        },
      },
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Add to history error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save search",
    });
  }
});

// Get search history (authenticated)
router.get("/history", optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.json({
        success: true,
        data: [],
      });
    }
    
    const user = await User.findById(req.userId).select("searchHistory");
    
    res.json({
      success: true,
      data: user?.searchHistory?.slice(-20).reverse() || [],
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get search history",
    });
  }
});

// Clear search history (authenticated)
router.delete("/history", optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.json({ success: true });
    }
    
    await User.findByIdAndUpdate(req.userId, {
      $set: { searchHistory: [] },
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Clear history error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to clear search history",
    });
  }
});

export default router;

