import { Router, Request, Response } from "express";
import Shop from "../models/Shop.js";

const router = Router();

// Get all shops with optional filters
router.get("/", async (req: Request, res: Response) => {
  try {
    const { location, tags, search, limit = 50, page = 1 } = req.query;
    
    const query: Record<string, unknown> = { isActive: true };
    
    if (location) {
      query["location.id"] = location;
    }
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tag = { $in: tagArray };
    }
    
    if (search) {
      query.$text = { $search: search as string };
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const shops = await Shop.find(query)
      .sort({ rating: -1, reviewCount: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Shop.countDocuments(query);
    
    res.json({
      success: true,
      data: shops,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get shops error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get shops",
    });
  }
});

// Get shop by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const shop = await Shop.findById(req.params.id);
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        error: "Shop not found",
      });
    }
    
    res.json({
      success: true,
      data: shop,
    });
  } catch (error) {
    console.error("Get shop error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get shop",
    });
  }
});

// Get shop by slug
router.get("/slug/:slug", async (req: Request, res: Response) => {
  try {
    const shop = await Shop.findOne({ slug: req.params.slug, isActive: true });
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        error: "Shop not found",
      });
    }
    
    res.json({
      success: true,
      data: {
        shop,
        locationLabel: shop.location.label,
      },
    });
  } catch (error) {
    console.error("Get shop by slug error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get shop",
    });
  }
});

// Get all locations
router.get("/meta/locations", async (_req: Request, res: Response) => {
  try {
    const locations = await Shop.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$location.id",
          label: { $first: "$location.label" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    
    res.json({
      success: true,
      data: locations.map((loc) => ({
        id: loc._id,
        label: loc.label,
        count: loc.count,
      })),
    });
  } catch (error) {
    console.error("Get locations error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get locations",
    });
  }
});

// Get all tags (optionally filtered by location)
router.get("/meta/tags", async (req: Request, res: Response) => {
  try {
    const { locationId } = req.query;
    
    const match: Record<string, unknown> = { isActive: true };
    if (locationId) {
      match["location.id"] = locationId;
    }
    
    const tags = await Shop.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$tag",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    
    res.json({
      success: true,
      data: tags.map((tag) => tag._id),
    });
  } catch (error) {
    console.error("Get tags error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get tags",
    });
  }
});

export default router;

