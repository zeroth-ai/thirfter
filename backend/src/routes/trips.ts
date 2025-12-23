import express, { Request, Response } from 'express';
import Trip from '../models/Trip';
import UserStats from '../models/UserStats';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get public trips
router.get('/public', async (req: Request, res: Response) => {
  try {
    const { location, date } = req.query;
    
    const query: any = { isPublic: true, status: 'planning' };
    
    if (date) {
      const targetDate = new Date(date as string);
      query.date = {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
      };
    } else {
      query.date = { $gte: new Date() };
    }

    const trips = await Trip.find(query)
      .sort({ date: 1 })
      .limit(20)
      .populate('creator', 'name avatar')
      .populate('stores.store', 'name location')
      .populate('participants.user', 'name avatar');

    res.json({ success: true, trips });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch trips' });
  }
});

// Get user's trips
router.get('/my', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const trips = await Trip.find({
      $or: [
        { creator: req.user!.id },
        { 'participants.user': req.user!.id },
      ],
    })
      .sort({ date: -1 })
      .populate('stores.store', 'name location')
      .populate('participants.user', 'name avatar');

    res.json({ success: true, trips });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch trips' });
  }
});

// Get single trip
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('creator', 'name avatar')
      .populate('stores.store', 'name location mapLink')
      .populate('participants.user', 'name avatar')
      .populate('chat.user', 'name avatar');

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    res.json({ success: true, trip });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch trip' });
  }
});

// Create trip
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, date, startTime, meetingPoint, stores, isPublic, maxParticipants } = req.body;

    const trip = new Trip({
      creator: req.user!.id,
      title,
      description,
      date,
      startTime,
      meetingPoint,
      stores: stores.map((s: any, i: number) => ({ store: s.store, order: i, notes: s.notes })),
      participants: [{ user: req.user!.id, status: 'going' }],
      isPublic: isPublic !== false,
      maxParticipants: maxParticipants || 10,
    });

    await trip.save();

    res.status(201).json({ success: true, trip });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create trip' });
  }
});

// Join trip
router.post('/:id/join', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { wishlist } = req.body;
    
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    // Check if already a participant
    const existingParticipant = trip.participants.find(
      p => p.user.toString() === req.user!.id
    );

    if (existingParticipant) {
      return res.status(400).json({ success: false, error: 'Already joined' });
    }

    // Check capacity
    const goingCount = trip.participants.filter(p => p.status === 'going').length;
    if (trip.maxParticipants && goingCount >= trip.maxParticipants) {
      return res.status(400).json({ success: false, error: 'Trip is full' });
    }

    trip.participants.push({
      user: req.user!.id,
      status: 'going',
      wishlist: wishlist || [],
    });

    await trip.save();

    // Update user stats
    await UserStats.findOneAndUpdate(
      { user: req.user!.id },
      { $inc: { tripsJoined: 1, xp: 20 } },
      { upsert: true }
    );

    res.json({ success: true, message: 'Joined trip' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to join trip' });
  }
});

// Update RSVP
router.patch('/:id/rsvp', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, 'participants.user': req.user!.id },
      { $set: { 'participants.$.status': status } },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found or not a participant' });
    }

    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update RSVP' });
  }
});

// Add to shared wishlist
router.post('/:id/wishlist', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { item } = req.body;
    
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { sharedWishlist: item } },
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    res.json({ success: true, wishlist: trip.sharedWishlist });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add to wishlist' });
  }
});

// Add chat message
router.post('/:id/chat', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          chat: {
            user: req.user!.id,
            message,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    ).populate('chat.user', 'name avatar');

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    res.json({ success: true, chat: trip.chat });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

// Invite friends
router.post('/:id/invite', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { userIds } = req.body;
    
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    // Add invited users
    for (const userId of userIds) {
      if (!trip.participants.find(p => p.user.toString() === userId)) {
        trip.participants.push({ user: userId, status: 'invited' });
      }
    }

    await trip.save();

    res.json({ success: true, message: `Invited ${userIds.length} friends` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to invite' });
  }
});

export default router;

