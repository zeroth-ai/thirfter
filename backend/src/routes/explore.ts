import { Router, Response } from "express";
import Shop from "../models/Shop.js";
import User from "../models/User.js";
import { optionalAuthMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

// Get all explore sections
router.get("/sections", optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const sections = [];
    
    // For You section (if authenticated)
    if (req.userId) {
      const user = await User.findById(req.userId);
      if (user?.preferences) {
        const forYouShops = await getPersonalizedShops(user.preferences);
        sections.push({
          title: "For You",
          subtitle: "Based on your style preferences",
          type: "for-you",
          items: forYouShops.map((shop) => ({
            shop,
            reason: "Matches your style",
            matchScore: 0.85,
            basedOn: "style" as const,
          })),
        });
      }
    }
    
    // Trending section
    const trendingShops = await Shop.find({ isActive: true })
      .sort({ reviewCount: -1, rating: -1 })
      .limit(6);
    
    sections.push({
      title: "Trending This Week",
      subtitle: "Most visited stores in Bangalore",
      type: "trending",
      items: trendingShops.map((shop) => ({
        shop,
        reason: "Popular choice",
        matchScore: 0.9,
        basedOn: "trending" as const,
      })),
    });
    
    // New stores section
    const newShops = await Shop.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(6);
    
    sections.push({
      title: "Recently Added",
      subtitle: "Fresh finds in our database",
      type: "new",
      items: newShops.map((shop) => ({
        shop,
        reason: "New addition",
        matchScore: 0.7,
        basedOn: "similar-users" as const,
      })),
    });
    
    res.json({
      success: true,
      data: sections,
    });
  } catch (error) {
    console.error("Get sections error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get explore sections",
    });
  }
});

// Get trending shops
router.get("/trending", async (_req, res: Response) => {
  try {
    const shops = await Shop.find({ isActive: true })
      .sort({ reviewCount: -1, rating: -1 })
      .limit(12);
    
    res.json({
      success: true,
      data: shops,
    });
  } catch (error) {
    console.error("Get trending error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get trending shops",
    });
  }
});

// Get personalized "For You" shops
router.get("/for-you", optionalAuthMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      // Return random selection for unauthenticated users
      const shops = await Shop.aggregate([
        { $match: { isActive: true } },
        { $sample: { size: 12 } },
      ]);
      
      return res.json({
        success: true,
        data: {
          title: "Recommended For You",
          subtitle: "Sign up to get personalized picks",
          type: "for-you",
          items: shops.map((shop) => ({
            shop,
            reason: "Popular in your area",
            matchScore: 0.7,
            basedOn: "trending" as const,
          })),
        },
      });
    }
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    
    const shops = await getPersonalizedShops(user.preferences);
    
    res.json({
      success: true,
      data: {
        title: "For You",
        subtitle: "Based on your style preferences",
        type: "for-you",
        items: shops.map((shop) => ({
          shop,
          reason: `Matches your ${user.preferences.style?.[0] || "style"} vibe`,
          matchScore: 0.85,
          basedOn: "style" as const,
        })),
      },
    });
  } catch (error) {
    console.error("Get for-you error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get recommendations",
    });
  }
});

// Get new stores
router.get("/new", async (_req, res: Response) => {
  try {
    const shops = await Shop.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(12);
    
    res.json({
      success: true,
      data: shops,
    });
  } catch (error) {
    console.error("Get new shops error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get new shops",
    });
  }
});

// Get shops by category
router.get("/category/:category", async (req, res: Response) => {
  try {
    const { category } = req.params;
    
    // Map category to tags
    const categoryTagMap: Record<string, string[]> = {
      trending: [], // Will use sorting
      vintage: ["Vintage", "Pre-Loved", "Thrift"],
      streetwear: ["Streetwear", "Hype", "Urban"],
      sustainable: ["Thrift", "Pre-Loved", "Sustainable"],
      designer: ["Luxury Thrift", "Premium", "Designer"],
      budget: ["Budget", "Cheapest", "Wholesale"],
      denim: ["Denim", "Jeans"],
      winter: ["Winter Wear", "Winter", "Jackets"],
    };
    
    const tags = categoryTagMap[category] || [];
    
    let shops;
    if (category === "trending" || tags.length === 0) {
      shops = await Shop.find({ isActive: true })
        .sort({ reviewCount: -1, rating: -1 })
        .limit(12);
    } else {
      shops = await Shop.find({
        isActive: true,
        tag: { $in: tags },
      })
        .sort({ rating: -1 })
        .limit(12);
    }
    
    res.json({
      success: true,
      data: shops,
    });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get category shops",
    });
  }
});

// Helper function for personalized recommendations
async function getPersonalizedShops(preferences: Record<string, unknown>) {
  const query: Record<string, unknown> = { isActive: true };
  
  // Filter by preferred locations if set
  if (preferences.favoriteLocations && (preferences.favoriteLocations as string[]).length > 0) {
    query["location.id"] = { $in: preferences.favoriteLocations };
  }
  
  // Filter by preferred categories/tags
  const styleToTagMap: Record<string, string[]> = {
    vintage: ["Vintage", "Pre-Loved", "Thrift"],
    y2k: ["Streetwear", "Hype"],
    grunge: ["Grunge", "Imports", "Alternative"],
    minimalist: ["Basics", "Premium"],
    streetwear: ["Streetwear", "Hype", "Urban"],
    cottagecore: ["Ethnic", "Boutique"],
    "old-money": ["Premium", "Formal", "Classic"],
    bohemian: ["Ethnic", "Boutique", "Vintage"],
  };
  
  const preferredTags: string[] = [];
  const styles = preferences.style as string[] || [];
  styles.forEach((style) => {
    const tags = styleToTagMap[style];
    if (tags) {
      preferredTags.push(...tags);
    }
  });
  
  if (preferredTags.length > 0) {
    query.tag = { $in: [...new Set(preferredTags)] };
  }
  
  const shops = await Shop.find(query)
    .sort({ rating: -1, reviewCount: -1 })
    .limit(12);
  
  // If not enough shops, fill with random ones
  if (shops.length < 6) {
    const additionalShops = await Shop.aggregate([
      { $match: { isActive: true, _id: { $nin: shops.map((s) => s._id) } } },
      { $sample: { size: 6 - shops.length } },
    ]);
    shops.push(...additionalShops);
  }
  
  return shops;
}

export default router;

