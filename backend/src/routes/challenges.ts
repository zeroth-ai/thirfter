import express, { Request, Response } from 'express';
import Challenge from '../models/Challenge';
import UserStats from '../models/UserStats';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get active challenges
router.get('/active', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    
    const challenges = await Challenge.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ isFeatured: -1, participantCount: -1 })
      .limit(10);

    res.json({ success: true, challenges });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch challenges' });
  }
});

// Get featured challenge
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const challenge = await Challenge.findOne({
      isActive: true,
      isFeatured: true,
      endDate: { $gte: new Date() },
    }).populate('submissions.user', 'name avatar');

    res.json({ success: true, challenge });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch featured challenge' });
  }
});

// Get single challenge
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('submissions.user', 'name avatar')
      .populate('submissions.haul', 'title images totalSpent');

    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }

    res.json({ success: true, challenge });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch challenge' });
  }
});

// Get challenge leaderboard
router.get('/:id/leaderboard', async (req: Request, res: Response) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('submissions.user', 'name avatar')
      .populate('submissions.haul', 'title images totalSpent totalSaved');

    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }

    const leaderboard = challenge.submissions
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 20)
      .map((s, i) => ({
        rank: i + 1,
        user: s.user,
        haul: s.haul,
        votes: s.votes,
        isWinner: s.isWinner,
      }));

    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
  }
});

// Submit to challenge
router.post('/:id/submit', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { haulId } = req.body;
    
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Challenge not found' });
    }

    // Check if challenge is active
    const now = new Date();
    if (now > challenge.endDate) {
      return res.status(400).json({ success: false, error: 'Challenge has ended' });
    }

    // Check if already submitted
    const existingSubmission = challenge.submissions.find(
      s => s.user.toString() === req.user!.id
    );
    if (existingSubmission) {
      return res.status(400).json({ success: false, error: 'Already submitted' });
    }

    challenge.submissions.push({
      user: req.user!.id,
      haul: haulId,
      submittedAt: new Date(),
      votes: 0,
    });
    challenge.participantCount += 1;

    await challenge.save();

    // Award XP for participating
    await UserStats.findOneAndUpdate(
      { user: req.user!.id },
      { $inc: { xp: 30 } },
      { upsert: true }
    );

    res.json({ success: true, message: 'Submitted to challenge' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to submit' });
  }
});

// Vote for submission
router.post('/:id/vote/:submissionUserId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const challenge = await Challenge.findOneAndUpdate(
      {
        _id: req.params.id,
        'submissions.user': req.params.submissionUserId,
      },
      { $inc: { 'submissions.$.votes': 1 } },
      { new: true }
    );

    if (!challenge) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    const submission = challenge.submissions.find(
      s => s.user.toString() === req.params.submissionUserId
    );

    res.json({ success: true, votes: submission?.votes || 0 });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to vote' });
  }
});

// Create challenge (admin only - simplified for now)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, type, rules, criteria, rewards, startDate, endDate, isFeatured } = req.body;

    const challenge = new Challenge({
      title,
      description,
      type,
      rules,
      criteria,
      rewards,
      startDate,
      endDate,
      isFeatured,
    });

    await challenge.save();

    res.status(201).json({ success: true, challenge });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create challenge' });
  }
});

// Get past challenges
router.get('/past', async (req: Request, res: Response) => {
  try {
    const challenges = await Challenge.find({
      endDate: { $lt: new Date() },
    })
      .sort({ endDate: -1 })
      .limit(10)
      .populate('submissions.user', 'name avatar');

    res.json({ success: true, challenges });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch past challenges' });
  }
});

export default router;

