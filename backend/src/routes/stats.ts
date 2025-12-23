import express, { Request, Response } from 'express';
import UserStats from '../models/UserStats';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get user stats
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    let stats = await UserStats.findOne({ user: req.user!.id })
      .populate('storesVisited', 'name');

    // Create stats if not exists
    if (!stats) {
      stats = new UserStats({ user: req.user!.id });
      await stats.save();
    }

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch stats' });
  }
});

// Get user's impact
router.get('/impact', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await UserStats.findOne({ user: req.user!.id });

    const impact = stats?.impact || {
      itemsThrifted: 0,
      textileWasteSaved: 0,
      waterSaved: 0,
      co2Saved: 0,
    };

    // Add equivalents for better understanding
    const equivalents = {
      waterSaved: {
        value: impact.waterSaved,
        unit: 'liters',
        equivalent: `${Math.round(impact.waterSaved / 150)} showers`,
      },
      co2Saved: {
        value: impact.co2Saved,
        unit: 'kg',
        equivalent: `${Math.round(impact.co2Saved / 0.12)} km not driven`,
      },
      textileWasteSaved: {
        value: impact.textileWasteSaved,
        unit: 'kg',
        equivalent: `${Math.round(impact.textileWasteSaved / 0.2)} t-shirts worth`,
      },
    };

    res.json({ success: true, impact, equivalents });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch impact' });
  }
});

// Get budget tracker
router.get('/budget', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await UserStats.findOne({ user: req.user!.id });

    res.json({
      success: true,
      budget: {
        monthlyBudget: stats?.monthlyBudget || null,
        monthlySpent: stats?.monthlySpent || 0,
        totalSpent: stats?.totalSpent || 0,
        totalSaved: stats?.totalSaved || 0,
        remaining: stats?.monthlyBudget 
          ? stats.monthlyBudget - (stats.monthlySpent || 0) 
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch budget' });
  }
});

// Set monthly budget
router.put('/budget', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { monthlyBudget } = req.body;

    const stats = await UserStats.findOneAndUpdate(
      { user: req.user!.id },
      { monthlyBudget },
      { upsert: true, new: true }
    );

    res.json({ success: true, monthlyBudget: stats.monthlyBudget });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update budget' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const { type = 'xp', limit = 20 } = req.query;

    let sortField: any = { xp: -1 };
    if (type === 'savings') sortField = { totalSaved: -1 };
    if (type === 'impact') sortField = { 'impact.itemsThrifted': -1 };

    const leaders = await UserStats.find()
      .sort(sortField)
      .limit(Number(limit))
      .populate('user', 'name avatar');

    const leaderboard = leaders.map((s, i) => ({
      rank: i + 1,
      user: s.user,
      xp: s.xp,
      level: s.level,
      totalSaved: s.totalSaved,
      itemsThrifted: s.impact.itemsThrifted,
      badges: s.badges.length,
    }));

    res.json({ success: true, leaderboard, type });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
  }
});

// Get badges
router.get('/badges', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await UserStats.findOne({ user: req.user!.id });

    // All available badges
    const allBadges = [
      { id: 'first-haul', name: 'First Haul', description: 'Posted your first haul', icon: '🛍️', requirement: 'Post 1 haul' },
      { id: 'thrift-master', name: 'Thrift Master', description: 'Posted 10 hauls', icon: '👑', requirement: 'Post 10 hauls' },
      { id: 'big-saver', name: 'Big Saver', description: 'Saved ₹5,000+', icon: '💰', requirement: 'Save ₹5,000' },
      { id: 'eco-warrior', name: 'Eco Warrior', description: 'Thrifted 50+ items', icon: '🌱', requirement: 'Thrift 50 items' },
      { id: 'explorer', name: 'Explorer', description: 'Visited 10 different stores', icon: '🗺️', requirement: 'Visit 10 stores' },
      { id: 'helper', name: 'Helper', description: 'Shared 5 tips', icon: '💡', requirement: 'Share 5 tips' },
      { id: 'social', name: 'Social Thrifter', description: 'Joined 3 group trips', icon: '👥', requirement: 'Join 3 trips' },
      { id: 'challenger', name: 'Challenger', description: 'Completed 5 challenges', icon: '🏆', requirement: 'Complete 5 challenges' },
      { id: 'streak-7', name: 'Week Warrior', description: '7-day activity streak', icon: '🔥', requirement: '7-day streak' },
      { id: 'influencer', name: 'Influencer', description: 'Got 100 likes on hauls', icon: '⭐', requirement: '100 total likes' },
    ];

    const earnedIds = (stats?.badges || []).map(b => b.id);

    const badges = allBadges.map(badge => ({
      ...badge,
      earned: earnedIds.includes(badge.id),
      earnedAt: stats?.badges.find(b => b.id === badge.id)?.earnedAt,
    }));

    res.json({ 
      success: true, 
      badges,
      earnedCount: earnedIds.length,
      totalCount: allBadges.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch badges' });
  }
});

// Mark store as visited
router.post('/visit/:storeId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await UserStats.findOneAndUpdate(
      { user: req.user!.id },
      { 
        $addToSet: { storesVisited: req.params.storeId },
        $inc: { xp: 5 },
      },
      { upsert: true, new: true }
    );

    // Check for explorer badge
    if (stats.storesVisited.length >= 10) {
      const hasExplorerBadge = stats.badges.some(b => b.id === 'explorer');
      if (!hasExplorerBadge) {
        stats.badges.push({
          id: 'explorer',
          name: 'Explorer',
          description: 'Visited 10 different stores',
          earnedAt: new Date(),
          icon: '🗺️',
        });
        await stats.save();
      }
    }

    res.json({ success: true, visitCount: stats.storesVisited.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to mark visit' });
  }
});

// Set current title
router.put('/title', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;

    const stats = await UserStats.findOneAndUpdate(
      { user: req.user!.id },
      { currentTitle: title },
      { new: true }
    );

    res.json({ success: true, currentTitle: stats?.currentTitle });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update title' });
  }
});

export default router;

