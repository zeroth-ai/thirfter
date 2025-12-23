import express, { Request, Response } from 'express';
import StyleBoard from '../models/StyleBoard';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get public style boards
router.get('/public', async (req: Request, res: Response) => {
  try {
    const { style, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = { isPublic: true };
    if (style) query.style = style;

    const boards = await StyleBoard.find(query)
      .sort({ likes: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name avatar');

    const total = await StyleBoard.countDocuments(query);

    res.json({
      success: true,
      boards,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch boards' });
  }
});

// Get user's boards
router.get('/my', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const boards = await StyleBoard.find({ user: req.user!.id })
      .sort({ updatedAt: -1 });

    res.json({ success: true, boards });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch boards' });
  }
});

// Get single board
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const board = await StyleBoard.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('items.store', 'name location');

    if (!board) {
      return res.status(404).json({ success: false, error: 'Board not found' });
    }

    res.json({ success: true, board });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch board' });
  }
});

// Create board
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, items, tags, style, isPublic } = req.body;

    const board = new StyleBoard({
      user: req.user!.id,
      name,
      description,
      items: items || [],
      tags: tags || [],
      style,
      isPublic: isPublic !== false,
    });

    // Set cover image from first item
    if (items && items.length > 0) {
      board.coverImage = items[0].image;
    }

    await board.save();

    res.status(201).json({ success: true, board });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create board' });
  }
});

// Update board
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, items, tags, style, isPublic, coverImage } = req.body;

    const board = await StyleBoard.findOneAndUpdate(
      { _id: req.params.id, user: req.user!.id },
      { name, description, items, tags, style, isPublic, coverImage },
      { new: true }
    );

    if (!board) {
      return res.status(404).json({ success: false, error: 'Board not found' });
    }

    res.json({ success: true, board });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update board' });
  }
});

// Add item to board
router.post('/:id/items', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { type, store, haul, name, image, price, link, position, notes } = req.body;

    const board = await StyleBoard.findOne({ _id: req.params.id, user: req.user!.id });
    if (!board) {
      return res.status(404).json({ success: false, error: 'Board not found' });
    }

    board.items.push({
      type,
      store,
      haul,
      name,
      image,
      price,
      link,
      position,
      notes,
    });

    // Update cover if first item
    if (board.items.length === 1) {
      board.coverImage = image;
    }

    await board.save();

    res.json({ success: true, board });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add item' });
  }
});

// Remove item from board
router.delete('/:id/items/:itemIndex', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const board = await StyleBoard.findOne({ _id: req.params.id, user: req.user!.id });
    if (!board) {
      return res.status(404).json({ success: false, error: 'Board not found' });
    }

    const index = parseInt(req.params.itemIndex);
    if (index >= 0 && index < board.items.length) {
      board.items.splice(index, 1);
      await board.save();
    }

    res.json({ success: true, board });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to remove item' });
  }
});

// Like board
router.post('/:id/like', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const board = await StyleBoard.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ success: false, error: 'Board not found' });
    }

    const userId = req.user!.id;
    const isLiked = board.likes.includes(userId);

    if (isLiked) {
      board.likes = board.likes.filter(id => id.toString() !== userId);
    } else {
      board.likes.push(userId);
    }

    await board.save();

    res.json({ success: true, liked: !isLiked, likeCount: board.likes.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to like board' });
  }
});

// Save board
router.post('/:id/save', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const board = await StyleBoard.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ success: false, error: 'Board not found' });
    }

    const userId = req.user!.id;
    const isSaved = board.saves.includes(userId);

    if (isSaved) {
      board.saves = board.saves.filter(id => id.toString() !== userId);
    } else {
      board.saves.push(userId);
    }

    await board.save();

    res.json({ success: true, saved: !isSaved });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to save board' });
  }
});

// Delete board
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const board = await StyleBoard.findOneAndDelete({
      _id: req.params.id,
      user: req.user!.id,
    });

    if (!board) {
      return res.status(404).json({ success: false, error: 'Board not found' });
    }

    res.json({ success: true, message: 'Board deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete board' });
  }
});

export default router;

