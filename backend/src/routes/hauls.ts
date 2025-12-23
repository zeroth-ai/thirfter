import express, { Request, Response } from 'express';
import Haul from '../models/Haul';
import UserStats from '../models/UserStats';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get haul feed (public)
router.get('/feed', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, sort = 'recent' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let sortOption: any = { createdAt: -1 };
    if (sort === 'popular') {
      sortOption = { likes: -1, createdAt: -1 };
    } else if (sort === 'savings') {
      sortOption = { totalSaved: -1 };
    }

    const hauls = await Haul.find({ isPublic: true })
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name avatar')
      .populate('items.store', 'name location');

    const total = await Haul.countDocuments({ isPublic: true });

    res.json({
      success: true,
      hauls,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch hauls' });
  }
});

// Get single haul
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const haul = await Haul.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('items.store', 'name location')
      .populate('comments.user', 'name avatar');

    if (!haul) {
      return res.status(404).json({ success: false, error: 'Haul not found' });
    }

    res.json({ success: true, haul });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch haul' });
  }
});

// Create haul (authenticated)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, items, images, tags, isPublic } = req.body;

    const haul = new Haul({
      user: req.user!.id,
      title,
      description,
      items,
      images,
      tags,
      isPublic: isPublic !== false,
    });

    await haul.save();

    // Update user stats
    await UserStats.findOneAndUpdate(
      { user: req.user!.id },
      {
        $inc: {
          haulsPosted: 1,
          totalSpent: haul.totalSpent,
          totalSaved: haul.totalSaved,
          'impact.itemsThrifted': items.length,
          'impact.textileWasteSaved': items.length * 0.5, // ~0.5kg per item
          'impact.waterSaved': items.length * 2700, // ~2700L per garment
          'impact.co2Saved': items.length * 3.6, // ~3.6kg CO2 per garment
          xp: 50 + items.length * 10,
        },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, haul });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create haul' });
  }
});

// Like haul
router.post('/:id/like', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const haul = await Haul.findById(req.params.id);
    if (!haul) {
      return res.status(404).json({ success: false, error: 'Haul not found' });
    }

    const userId = req.user!.id;
    const isLiked = haul.likes.includes(userId);

    if (isLiked) {
      haul.likes = haul.likes.filter(id => id.toString() !== userId);
    } else {
      haul.likes.push(userId);
    }

    await haul.save();

    res.json({ success: true, liked: !isLiked, likeCount: haul.likes.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to like haul' });
  }
});

// Add comment
router.post('/:id/comment', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;
    
    const haul = await Haul.findById(req.params.id);
    if (!haul) {
      return res.status(404).json({ success: false, error: 'Haul not found' });
    }

    haul.comments.push({
      user: req.user!.id,
      text,
      createdAt: new Date(),
    });

    await haul.save();

    const populatedHaul = await Haul.findById(haul._id)
      .populate('comments.user', 'name avatar');

    res.json({ success: true, comments: populatedHaul!.comments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add comment' });
  }
});

// Get user's hauls
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const hauls = await Haul.find({ user: req.params.userId, isPublic: true })
      .sort({ createdAt: -1 })
      .populate('items.store', 'name');

    res.json({ success: true, hauls });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user hauls' });
  }
});

// Delete haul
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const haul = await Haul.findOneAndDelete({
      _id: req.params.id,
      user: req.user!.id,
    });

    if (!haul) {
      return res.status(404).json({ success: false, error: 'Haul not found' });
    }

    res.json({ success: true, message: 'Haul deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete haul' });
  }
});

export default router;

