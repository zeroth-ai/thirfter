import express, { Request, Response } from 'express';
import Tip from '../models/Tip';
import UserStats from '../models/UserStats';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get tips for a store
router.get('/store/:storeId', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    
    const query: any = { store: req.params.storeId, isApproved: true };
    if (type) query.type = type;

    const tips = await Tip.find(query)
      .sort({ isVerified: -1, upvotes: -1 })
      .populate('user', 'name avatar');

    res.json({ success: true, tips });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch tips' });
  }
});

// Get all tips by type
router.get('/type/:type', async (req: Request, res: Response) => {
  try {
    const tips = await Tip.find({ type: req.params.type, isApproved: true })
      .sort({ isVerified: -1, upvotes: -1 })
      .limit(20)
      .populate('user', 'name avatar')
      .populate('store', 'name location');

    res.json({ success: true, tips });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch tips' });
  }
});

// Create tip
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { store, type, title, content, data } = req.body;

    const tip = new Tip({
      user: req.user!.id,
      store,
      type,
      title,
      content,
      data,
    });

    await tip.save();

    // Award XP for sharing tips
    await UserStats.findOneAndUpdate(
      { user: req.user!.id },
      { $inc: { tipsShared: 1, xp: 25 } },
      { upsert: true }
    );

    res.status(201).json({ success: true, tip });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create tip' });
  }
});

// Upvote tip
router.post('/:id/upvote', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const tip = await Tip.findById(req.params.id);
    if (!tip) {
      return res.status(404).json({ success: false, error: 'Tip not found' });
    }

    const userId = req.user!.id;
    
    // Remove from downvotes if present
    tip.downvotes = tip.downvotes.filter(id => id.toString() !== userId);
    
    // Toggle upvote
    const hasUpvoted = tip.upvotes.includes(userId);
    if (hasUpvoted) {
      tip.upvotes = tip.upvotes.filter(id => id.toString() !== userId);
    } else {
      tip.upvotes.push(userId);
    }

    await tip.save();

    res.json({ 
      success: true, 
      upvoted: !hasUpvoted, 
      upvotes: tip.upvotes.length,
      downvotes: tip.downvotes.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to upvote' });
  }
});

// Downvote tip
router.post('/:id/downvote', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const tip = await Tip.findById(req.params.id);
    if (!tip) {
      return res.status(404).json({ success: false, error: 'Tip not found' });
    }

    const userId = req.user!.id;
    
    // Remove from upvotes if present
    tip.upvotes = tip.upvotes.filter(id => id.toString() !== userId);
    
    // Toggle downvote
    const hasDownvoted = tip.downvotes.includes(userId);
    if (hasDownvoted) {
      tip.downvotes = tip.downvotes.filter(id => id.toString() !== userId);
    } else {
      tip.downvotes.push(userId);
    }

    await tip.save();

    res.json({ 
      success: true, 
      downvoted: !hasDownvoted, 
      upvotes: tip.upvotes.length,
      downvotes: tip.downvotes.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to downvote' });
  }
});

// Verify tip (by other users)
router.post('/:id/verify', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const tip = await Tip.findById(req.params.id);
    if (!tip) {
      return res.status(404).json({ success: false, error: 'Tip not found' });
    }

    const userId = req.user!.id;
    
    if (!tip.verifiedBy.includes(userId)) {
      tip.verifiedBy.push(userId);
      
      // Auto-verify if 3+ users verified
      if (tip.verifiedBy.length >= 3) {
        tip.isVerified = true;
      }
    }

    await tip.save();

    res.json({ 
      success: true, 
      isVerified: tip.isVerified,
      verificationCount: tip.verifiedBy.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to verify' });
  }
});

// Report tip
router.post('/:id/report', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const tip = await Tip.findByIdAndUpdate(
      req.params.id,
      { $inc: { reports: 1 } },
      { new: true }
    );

    if (!tip) {
      return res.status(404).json({ success: false, error: 'Tip not found' });
    }

    // Auto-hide if too many reports
    if (tip.reports >= 5) {
      tip.isApproved = false;
      await tip.save();
    }

    res.json({ success: true, message: 'Tip reported' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to report' });
  }
});

export default router;

