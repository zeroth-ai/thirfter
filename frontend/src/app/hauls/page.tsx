'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Share2, Plus, Camera, X,
  Sparkles, TrendingUp, Clock, DollarSign, Leaf
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

interface HaulItem {
  name: string;
  price: number;
  retailPrice?: number;
  store?: string;
  image?: string;
}

interface Haul {
  _id: string;
  user: { name: string; avatar?: string };
  title: string;
  description?: string;
  items: HaulItem[];
  totalSpent: number;
  totalSaved: number;
  images: string[];
  likes: string[];
  comments: { user: { name: string }; text: string; createdAt: string }[];
  tags: string[];
  createdAt: string;
}

// Mock data for demo
const mockHauls: Haul[] = [
  {
    _id: '1',
    user: { name: 'Priya S.', avatar: '👧' },
    title: '₹800 Complete Outfit from Tibet Mall! 🔥',
    description: 'Found these gems at Tibet Mall yesterday. The jacket alone would be 3k retail!',
    items: [
      { name: 'Denim Jacket', price: 350, retailPrice: 1500 },
      { name: 'Graphic Tee', price: 150, retailPrice: 599 },
      { name: 'Cargo Pants', price: 300, retailPrice: 1200 },
    ],
    totalSpent: 800,
    totalSaved: 2499,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'],
    likes: ['1', '2', '3', '4', '5'],
    comments: [
      { user: { name: 'Rahul' }, text: 'That jacket is fire! 🔥', createdAt: '2024-01-15' },
    ],
    tags: ['denim', 'streetwear', 'budget'],
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    _id: '2',
    user: { name: 'Arjun M.', avatar: '🧑' },
    title: 'Vintage finds at Commercial Street 🏪',
    description: 'Spent the whole morning digging through piles. Worth it!',
    items: [
      { name: 'Vintage Band Tee', price: 200, retailPrice: 800 },
      { name: 'Corduroy Shirt', price: 280, retailPrice: 1100 },
    ],
    totalSpent: 480,
    totalSaved: 1420,
    images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400'],
    likes: ['1', '2', '3'],
    comments: [],
    tags: ['vintage', 'retro'],
    createdAt: '2024-01-14T15:00:00Z',
  },
  {
    _id: '3',
    user: { name: 'Sneha K.', avatar: '👩' },
    title: 'HSR Layout surplus store haul 💫',
    description: 'Export surplus with tags still on! Most items under ₹300',
    items: [
      { name: 'Linen Shirt', price: 250, retailPrice: 1800 },
      { name: 'Cotton Dress', price: 300, retailPrice: 2000 },
      { name: 'Scarf', price: 100, retailPrice: 500 },
    ],
    totalSpent: 650,
    totalSaved: 3650,
    images: ['https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400'],
    likes: ['1', '2', '3', '4', '5', '6', '7'],
    comments: [
      { user: { name: 'Meera' }, text: 'Which store is this? 😍', createdAt: '2024-01-14' },
      { user: { name: 'Anika' }, text: 'The dress is gorgeous!', createdAt: '2024-01-14' },
    ],
    tags: ['surplus', 'linen', 'summer'],
    createdAt: '2024-01-14T09:00:00Z',
  },
];

export default function HaulsPage() {
  const [hauls, setHauls] = useState<Haul[]>(mockHauls);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'savings'>('recent');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedHaul, setSelectedHaul] = useState<Haul | null>(null);

  const handleLike = (haulId: string) => {
    setHauls(hauls.map(haul => {
      if (haul._id === haulId) {
        const isLiked = haul.likes.includes('current-user');
        return {
          ...haul,
          likes: isLiked 
            ? haul.likes.filter(id => id !== 'current-user')
            : [...haul.likes, 'current-user'],
        };
      }
      return haul;
    }));
  };

  const sortedHauls = [...hauls].sort((a, b) => {
    if (sortBy === 'popular') return b.likes.length - a.likes.length;
    if (sortBy === 'savings') return b.totalSaved - a.totalSaved;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-canvas py-8">
      <Container>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-fg-on-canvas mb-2">
              Thrift Hauls 🛍️
            </h1>
            <p className="text-fg-muted">
              Share your finds, flex your savings
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Post Haul
          </Button>
        </div>

        {/* Sort Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'recent', label: 'Recent', icon: Clock },
            { id: 'popular', label: 'Popular', icon: TrendingUp },
            { id: 'savings', label: 'Best Saves', icon: DollarSign },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSortBy(tab.id as typeof sortBy)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                sortBy === tab.id
                  ? 'bg-accent-green text-white'
                  : 'bg-canvas-subtle text-fg-muted hover:bg-canvas-overlay'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Hauls Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {sortedHauls.map((haul, index) => (
              <motion.div
                key={haul._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-canvas-subtle rounded-xl overflow-hidden border border-border hover:border-accent-green/50 transition-all cursor-pointer"
                onClick={() => setSelectedHaul(haul)}
              >
                {/* Image */}
                {haul.images[0] && (
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={haul.images[0]}
                      alt={haul.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-accent-green text-white px-3 py-1 rounded-full text-sm font-medium">
                      Saved ₹{haul.totalSaved}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  {/* User */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center">
                      {haul.user.avatar || haul.user.name[0]}
                    </div>
                    <span className="text-sm text-fg-muted">{haul.user.name}</span>
                    <span className="text-xs text-fg-muted ml-auto">
                      {new Date(haul.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-fg-on-canvas mb-2 line-clamp-2">
                    {haul.title}
                  </h3>

                  {/* Items summary */}
                  <p className="text-sm text-fg-muted mb-3">
                    {haul.items.length} items • Spent ₹{haul.totalSpent}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {haul.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-canvas-overlay rounded-full text-fg-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-3 border-t border-border">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(haul._id);
                      }}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        haul.likes.includes('current-user')
                          ? 'text-accent-pink'
                          : 'text-fg-muted hover:text-accent-pink'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${haul.likes.includes('current-user') ? 'fill-current' : ''}`} />
                      {haul.likes.length}
                    </button>
                    <button className="flex items-center gap-1 text-sm text-fg-muted hover:text-fg">
                      <MessageCircle className="w-4 h-4" />
                      {haul.comments.length}
                    </button>
                    <button className="flex items-center gap-1 text-sm text-fg-muted hover:text-fg ml-auto">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <CreateHaulModal onClose={() => setShowCreateModal(false)} />
          )}
        </AnimatePresence>

        {/* Haul Detail Modal */}
        <AnimatePresence>
          {selectedHaul && (
            <HaulDetailModal haul={selectedHaul} onClose={() => setSelectedHaul(null)} />
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
}

function CreateHaulModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<HaulItem[]>([{ name: '', price: 0 }]);

  const addItem = () => {
    setItems([...items, { name: '', price: 0 }]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-canvas-subtle rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-fg-on-canvas">Post Your Haul</h2>
            <button onClick={onClose} className="text-fg-muted hover:text-fg">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-fg mb-2">Photos</label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent-green/50 transition-colors cursor-pointer">
              <Camera className="w-8 h-8 mx-auto text-fg-muted mb-2" />
              <p className="text-fg-muted text-sm">Click to upload photos</p>
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Amazing finds at Tibet Mall!"
              className="w-full px-4 py-2 bg-canvas rounded-lg border border-border focus:border-accent-green focus:outline-none"
            />
          </div>

          {/* Items */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg mb-2">Items</label>
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Item name"
                  className="flex-1 px-3 py-2 bg-canvas rounded-lg border border-border focus:border-accent-green focus:outline-none text-sm"
                />
                <input
                  type="number"
                  placeholder="₹ Price"
                  className="w-24 px-3 py-2 bg-canvas rounded-lg border border-border focus:border-accent-green focus:outline-none text-sm"
                />
              </div>
            ))}
            <button
              onClick={addItem}
              className="text-sm text-accent-green hover:underline"
            >
              + Add another item
            </button>
          </div>

          {/* Submit */}
          <Button className="w-full mt-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Post Haul
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function HaulDetailModal({ haul, onClose }: { haul: Haul; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-canvas-subtle rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Image */}
        {haul.images[0] && (
          <div className="aspect-video relative overflow-hidden rounded-t-2xl">
            <img
              src={haul.images[0]}
              alt={haul.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/50 rounded-full p-2 text-white hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-6">
          {/* User & Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center text-lg">
              {haul.user.avatar || haul.user.name[0]}
            </div>
            <div>
              <p className="font-medium text-fg-on-canvas">{haul.user.name}</p>
              <p className="text-sm text-fg-muted">
                {new Date(haul.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-fg-on-canvas mb-2">{haul.title}</h2>
          {haul.description && (
            <p className="text-fg-muted mb-4">{haul.description}</p>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-canvas rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-fg-on-canvas">₹{haul.totalSpent}</p>
              <p className="text-xs text-fg-muted">Total Spent</p>
            </div>
            <div className="bg-accent-green/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-accent-green">₹{haul.totalSaved}</p>
              <p className="text-xs text-fg-muted">Saved</p>
            </div>
            <div className="bg-canvas rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-fg-on-canvas">{haul.items.length}</p>
              <p className="text-xs text-fg-muted">Items</p>
            </div>
          </div>

          {/* Items List */}
          <div className="mb-6">
            <h3 className="font-semibold text-fg mb-3">Items</h3>
            <div className="space-y-2">
              {haul.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-canvas rounded-lg p-3">
                  <span className="text-fg">{item.name}</span>
                  <div className="text-right">
                    <span className="text-fg-on-canvas font-medium">₹{item.price}</span>
                    {item.retailPrice && (
                      <span className="text-fg-muted text-sm line-through ml-2">
                        ₹{item.retailPrice}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Environmental Impact */}
          <div className="bg-accent-green/10 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-5 h-5 text-accent-green" />
              <span className="font-medium text-fg">Environmental Impact</span>
            </div>
            <p className="text-sm text-fg-muted">
              By thrifting these {haul.items.length} items, you saved approximately{' '}
              <strong className="text-fg">{(haul.items.length * 2700).toLocaleString()} liters</strong> of water and{' '}
              <strong className="text-fg">{(haul.items.length * 3.6).toFixed(1)} kg</strong> of CO2!
            </p>
          </div>

          {/* Comments */}
          {haul.comments.length > 0 && (
            <div>
              <h3 className="font-semibold text-fg mb-3">Comments</h3>
              <div className="space-y-3">
                {haul.comments.map((comment, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-canvas-overlay flex items-center justify-center text-sm">
                      {comment.user.name[0]}
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium text-fg">{comment.user.name}</span>{' '}
                        <span className="text-fg-muted">{comment.text}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

