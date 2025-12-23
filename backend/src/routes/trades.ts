import express, { Request, Response } from 'express';
import Trade from '../models/Trade';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get trade listings
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, location, category, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { status: 'active' };
    
    if (type) query.type = type;
    if (location) query['location.area'] = location;
    if (category) query['item.category'] = category;

    const trades = await Trade.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name avatar')
      .populate('item.originalStore', 'name');

    const total = await Trade.countDocuments(query);

    res.json({
      success: true,
      trades,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch trades' });
  }
});

// Get ISO (In Search Of) posts
router.get('/iso', async (req: Request, res: Response) => {
  try {
    const { location } = req.query;
    
    const query: any = { type: 'iso', status: 'active' };
    if (location) query['location.area'] = location;

    const trades = await Trade.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('user', 'name avatar');

    res.json({ success: true, trades });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch ISO posts' });
  }
});

// Get single trade
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const trade = await Trade.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('user', 'name avatar')
      .populate('item.originalStore', 'name location')
      .populate('interests.user', 'name avatar');

    if (!trade) {
      return res.status(404).json({ success: false, error: 'Trade not found' });
    }

    res.json({ success: true, trade });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch trade' });
  }
});

// Create trade listing
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { type, title, description, item, price, isNegotiable, lookingFor, images, location } = req.body;

    const trade = new Trade({
      user: req.user!.id,
      type,
      title,
      description,
      item,
      price,
      isNegotiable: isNegotiable !== false,
      lookingFor,
      images,
      location,
    });

    await trade.save();

    res.status(201).json({ success: true, trade });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create listing' });
  }
});

// Express interest
router.post('/:id/interest', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    
    const trade = await Trade.findById(req.params.id);
    if (!trade) {
      return res.status(404).json({ success: false, error: 'Trade not found' });
    }

    // Check if already interested
    const existingInterest = trade.interests.find(
      i => i.user.toString() === req.user!.id
    );
    if (existingInterest) {
      return res.status(400).json({ success: false, error: 'Already expressed interest' });
    }

    trade.interests.push({
      user: req.user!.id,
      message,
      createdAt: new Date(),
    });

    await trade.save();

    res.json({ success: true, message: 'Interest expressed' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to express interest' });
  }
});

// Save trade
router.post('/:id/save', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) {
      return res.status(404).json({ success: false, error: 'Trade not found' });
    }

    const userId = req.user!.id;
    const isSaved = trade.saves.includes(userId);

    if (isSaved) {
      trade.saves = trade.saves.filter(id => id.toString() !== userId);
    } else {
      trade.saves.push(userId);
    }

    await trade.save();

    res.json({ success: true, saved: !isSaved });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save trade' });
  }
});

// Update trade status
router.patch('/:id/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    
    const trade = await Trade.findOneAndUpdate(
      { _id: req.params.id, user: req.user!.id },
      { status },
      { new: true }
    );

    if (!trade) {
      return res.status(404).json({ success: false, error: 'Trade not found' });
    }

    res.json({ success: true, status: trade.status });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

// Get user's trades
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const trades = await Trade.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('item.originalStore', 'name');

    res.json({ success: true, trades });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user trades' });
  }
});

// Delete trade
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const trade = await Trade.findOneAndDelete({
      _id: req.params.id,
      user: req.user!.id,
    });

    if (!trade) {
      return res.status(404).json({ success: false, error: 'Trade not found' });
    }

    res.json({ success: true, message: 'Trade deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete trade' });
  }
});

export default router;

