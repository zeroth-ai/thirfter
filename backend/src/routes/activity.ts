import express, { Request, Response } from 'express';
import StoreActivity from '../models/StoreActivity';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get store activity
router.get('/store/:storeId', async (req: Request, res: Response) => {
  try {
    let activity = await StoreActivity.findOne({ store: req.params.storeId })
      .populate('recentSpots.user', 'name avatar');

    if (!activity) {
      activity = new StoreActivity({ store: req.params.storeId });
      await activity.save();
    }

    res.json({ success: true, activity });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch activity' });
  }
});

// Report crowd level
router.post('/store/:storeId/crowd', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { level } = req.body;

    const activity = await StoreActivity.findOneAndUpdate(
      { store: req.params.storeId },
      {
        $push: {
          crowdReports: {
            user: req.user!.id,
            level,
            reportedAt: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    );

    res.json({ 
      success: true, 
      crowdLevel: activity.crowdLevel,
      message: 'Thanks for reporting!',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to report crowd' });
  }
});

// Spot an item
router.post('/store/:storeId/spot', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { item, size, price, image } = req.body;

    const activity = await StoreActivity.findOneAndUpdate(
      { store: req.params.storeId },
      {
        $push: {
          recentSpots: {
            user: req.user!.id,
            item,
            size,
            price,
            image,
            spottedAt: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    ).populate('recentSpots.user', 'name avatar');

    res.json({ 
      success: true, 
      recentSpots: activity.recentSpots.slice(-10),
      message: 'Item spotted! Others will see this.',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to spot item' });
  }
});

// Get best times for a store
router.get('/store/:storeId/best-times', async (req: Request, res: Response) => {
  try {
    const activity = await StoreActivity.findOne({ store: req.params.storeId });

    if (!activity || !activity.bestTimes || activity.bestTimes.length === 0) {
      // Return default data
      return res.json({
        success: true,
        bestTimes: getDefaultBestTimes(),
        source: 'default',
      });
    }

    res.json({ 
      success: true, 
      bestTimes: activity.bestTimes,
      source: 'community',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch best times' });
  }
});

// Get haggling info
router.get('/store/:storeId/haggling', async (req: Request, res: Response) => {
  try {
    const activity = await StoreActivity.findOne({ store: req.params.storeId });

    res.json({ 
      success: true, 
      hagglingInfo: activity?.hagglingInfo || {
        isAllowed: true,
        typicalDiscount: 10,
        tips: ['Be polite', 'Buy multiple items for better deals', 'Visit on weekdays'],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch haggling info' });
  }
});

// Update haggling info
router.post('/store/:storeId/haggling', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { isAllowed, typicalDiscount, tip } = req.body;

    const updateData: any = {};
    if (isAllowed !== undefined) updateData['hagglingInfo.isAllowed'] = isAllowed;
    if (typicalDiscount !== undefined) updateData['hagglingInfo.typicalDiscount'] = typicalDiscount;

    const pushData: any = {};
    if (tip) pushData['hagglingInfo.tips'] = tip;

    const activity = await StoreActivity.findOneAndUpdate(
      { store: req.params.storeId },
      { 
        $set: updateData,
        ...(tip ? { $addToSet: pushData } : {}),
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, hagglingInfo: activity.hagglingInfo });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update haggling info' });
  }
});

// Report student discount
router.post('/store/:storeId/student-discount', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { percentage, details } = req.body;

    const activity = await StoreActivity.findOneAndUpdate(
      { store: req.params.storeId },
      {
        $set: {
          studentDiscount: {
            percentage,
            details,
            verified: false,
          },
        },
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, studentDiscount: activity.studentDiscount });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to report discount' });
  }
});

// Get stores with student discounts
router.get('/student-discounts', async (req: Request, res: Response) => {
  try {
    const activities = await StoreActivity.find({
      'studentDiscount.percentage': { $gt: 0 },
    }).populate('store', 'name location');

    res.json({ 
      success: true, 
      stores: activities.map(a => ({
        store: a.store,
        discount: a.studentDiscount,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch discounts' });
  }
});

// Get all stores by crowd level
router.get('/crowd-status', async (req: Request, res: Response) => {
  try {
    const activities = await StoreActivity.find({
      lastCrowdUpdate: { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) }, // Last 2 hours
    }).populate('store', 'name location');

    res.json({ 
      success: true, 
      stores: activities.map(a => ({
        store: a.store,
        crowdLevel: a.crowdLevel,
        lastUpdate: a.lastCrowdUpdate,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch crowd status' });
  }
});

// Helper function for default best times
function getDefaultBestTimes() {
  const times = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 10; hour <= 20; hour++) {
      let crowdLevel = 3; // moderate by default
      
      // Weekdays are less crowded
      if (day >= 1 && day <= 5) {
        if (hour >= 10 && hour <= 12) crowdLevel = 1; // morning - quiet
        else if (hour >= 12 && hour <= 15) crowdLevel = 2;
        else if (hour >= 17 && hour <= 19) crowdLevel = 4; // evening rush
      } else {
        // Weekends are busier
        if (hour >= 11 && hour <= 18) crowdLevel = 4;
        else crowdLevel = 3;
      }
      
      times.push({ day, hour, crowdLevel });
    }
  }
  return times;
}

export default router;

