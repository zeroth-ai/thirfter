import express, { Response } from 'express';
import Alert from '../models/Alert';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get user's alerts
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const alerts = await Alert.find({ user: req.user!.id })
      .sort({ createdAt: -1 })
      .populate('criteria.stores', 'name');

    res.json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch alerts' });
  }
});

// Create alert
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { type, criteria, notifyVia, frequency } = req.body;

    // Limit alerts per user
    const existingCount = await Alert.countDocuments({ user: req.user!.id, isActive: true });
    if (existingCount >= 10) {
      return res.status(400).json({ 
        success: false, 
        error: 'Maximum 10 active alerts allowed' 
      });
    }

    const alert = new Alert({
      user: req.user!.id,
      type,
      criteria,
      notifyVia: notifyVia || ['push'],
      frequency: frequency || 'instant',
    });

    await alert.save();

    res.status(201).json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create alert' });
  }
});

// Update alert
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { criteria, notifyVia, frequency, isActive } = req.body;

    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, user: req.user!.id },
      { criteria, notifyVia, frequency, isActive },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update alert' });
  }
});

// Delete alert
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const alert = await Alert.findOneAndDelete({
      _id: req.params.id,
      user: req.user!.id,
    });

    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    res.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete alert' });
  }
});

// Toggle alert active status
router.patch('/:id/toggle', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const alert = await Alert.findOne({ _id: req.params.id, user: req.user!.id });

    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    alert.isActive = !alert.isActive;
    await alert.save();

    res.json({ success: true, isActive: alert.isActive });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to toggle alert' });
  }
});

// Get alert suggestions based on user preferences
router.get('/suggestions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const suggestions = [
      {
        type: 'price_drop',
        title: 'Budget Finds Alert',
        description: 'Get notified when items under ₹500 are spotted',
        criteria: { maxPrice: 500 },
      },
      {
        type: 'restock',
        title: 'Restock Alert',
        description: 'Know when your favorite stores get new stock',
        criteria: {},
      },
      {
        type: 'new_store',
        title: 'New Store Alert',
        description: 'Discover new thrift stores in your area',
        criteria: {},
      },
      {
        type: 'flash_sale',
        title: 'Flash Sale Alert',
        description: 'Never miss a sale again',
        criteria: {},
      },
    ];

    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get suggestions' });
  }
});

export default router;

