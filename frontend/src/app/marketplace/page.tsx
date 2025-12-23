'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Plus, X, Search, MapPin, 
  Heart, MessageCircle, Eye, Filter, Tag,
  ArrowUpDown, Package, Repeat, HelpCircle
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

interface Trade {
  id: string;
  type: 'sell' | 'trade' | 'iso';
  user: { name: string; avatar?: string };
  title: string;
  description: string;
  item?: {
    name: string;
    category: string;
    size?: string;
    condition: string;
    originalPrice?: number;
  };
  price?: number;
  isNegotiable: boolean;
  lookingFor?: string[];
  images: string[];
  location: { area: string };
  views: number;
  saves: number;
  createdAt: string;
}

const mockTrades: Trade[] = [
  {
    id: '1',
    type: 'sell',
    user: { name: 'Arjun M.', avatar: '🧑' },
    title: 'Vintage Levi\'s Denim Jacket - Size M',
    description: 'Got this from Tibet Mall but it\'s slightly big for me. Worn once, perfect condition. Price is negotiable!',
    item: {
      name: 'Levi\'s Denim Jacket',
      category: 'Jackets',
      size: 'M',
      condition: 'like_new',
      originalPrice: 450,
    },
    price: 400,
    isNegotiable: true,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400'],
    location: { area: 'HSR Layout' },
    views: 45,
    saves: 8,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    type: 'trade',
    user: { name: 'Sneha K.', avatar: '👩' },
    title: 'Nike Air Force 1 - Size 8',
    description: 'Found these at a surplus store. Looking to trade for a similar condition sneaker in size 7.',
    item: {
      name: 'Nike Air Force 1',
      category: 'Shoes',
      size: '8',
      condition: 'good',
    },
    isNegotiable: false,
    lookingFor: ['Sneakers size 7', 'Converse', 'Vans'],
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400'],
    location: { area: 'Koramangala' },
    views: 32,
    saves: 5,
    createdAt: '2024-01-14T15:00:00Z',
  },
  {
    id: '3',
    type: 'iso',
    user: { name: 'Priya S.', avatar: '👧' },
    title: 'ISO: Cargo Pants Size S/M',
    description: 'Looking for good condition cargo pants. Preferably in neutral colors (black, khaki, olive). Budget: ₹300-500',
    isNegotiable: true,
    lookingFor: ['Cargo pants S', 'Cargo pants M', 'Black/Khaki/Olive'],
    images: [],
    location: { area: 'Indiranagar' },
    views: 28,
    saves: 3,
    createdAt: '2024-01-14T12:00:00Z',
  },
];

export default function MarketplacePage() {
  const [trades, setTrades] = useState<Trade[]>(mockTrades);
  const [filter, setFilter] = useState<'all' | 'sell' | 'trade' | 'iso'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredTrades = trades.filter(trade => {
    if (filter !== 'all' && trade.type !== filter) return false;
    if (searchQuery && !trade.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sell': return ShoppingBag;
      case 'trade': return Repeat;
      case 'iso': return HelpCircle;
      default: return Package;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sell': return 'bg-accent-green/20 text-accent-green';
      case 'trade': return 'bg-accent-blue/20 text-accent-blue';
      case 'iso': return 'bg-accent-purple/20 text-accent-purple';
      default: return 'bg-canvas text-fg-muted';
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'new': return 'New with tags';
      case 'like_new': return 'Like new';
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      default: return condition;
    }
  };

  return (
    <div className="min-h-screen bg-canvas py-8">
      <Container>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-fg-on-canvas mb-2">
              Thrift Marketplace 🏪
            </h1>
            <p className="text-fg-muted">
              Buy, sell, trade, or find what you're looking for
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Listing
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-fg-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search listings..."
              className="w-full pl-10 pr-4 py-2 bg-canvas-subtle rounded-lg border border-border focus:border-accent-green focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'sell', label: 'For Sale', icon: ShoppingBag },
              { id: 'trade', label: 'Trade', icon: Repeat },
              { id: 'iso', label: 'ISO', icon: HelpCircle },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as typeof filter)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  filter === f.id
                    ? 'bg-accent-green text-white'
                    : 'bg-canvas-subtle text-fg-muted hover:bg-canvas-overlay'
                }`}
              >
                {f.icon && <f.icon className="w-4 h-4" />}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredTrades.map((trade, index) => {
              const TypeIcon = getTypeIcon(trade.type);
              return (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-canvas-subtle rounded-xl overflow-hidden border border-border hover:border-accent-green/50 transition-all"
                >
                  {/* Image or Placeholder */}
                  {trade.images[0] ? (
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={trade.images[0]}
                        alt={trade.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getTypeColor(trade.type)}`}>
                        <TypeIcon className="w-3 h-3" />
                        {trade.type === 'iso' ? 'Looking For' : trade.type === 'trade' ? 'Trade' : 'For Sale'}
                      </div>
                      {trade.price && (
                        <div className="absolute bottom-3 right-3 bg-canvas/90 backdrop-blur px-3 py-1 rounded-full">
                          <span className="font-bold text-fg-on-canvas">₹{trade.price}</span>
                          {trade.isNegotiable && (
                            <span className="text-xs text-fg-muted ml-1">nego</span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-square bg-canvas flex items-center justify-center">
                      <div className="text-center p-4">
                        <HelpCircle className="w-12 h-12 mx-auto text-fg-muted mb-2" />
                        <p className="text-sm text-fg-muted">Looking for items</p>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    {/* User & Type */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-accent-purple/20 flex items-center justify-center text-xs">
                        {trade.user.avatar || trade.user.name[0]}
                      </div>
                      <span className="text-sm text-fg-muted">{trade.user.name}</span>
                      <span className="text-xs text-fg-muted ml-auto flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {trade.location.area}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-fg-on-canvas mb-2 line-clamp-2">
                      {trade.title}
                    </h3>

                    {/* Item Details */}
                    {trade.item && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {trade.item.size && (
                          <span className="text-xs px-2 py-1 bg-canvas rounded-full text-fg-muted">
                            Size {trade.item.size}
                          </span>
                        )}
                        <span className="text-xs px-2 py-1 bg-canvas rounded-full text-fg-muted">
                          {getConditionLabel(trade.item.condition)}
                        </span>
                      </div>
                    )}

                    {/* Looking For (ISO/Trade) */}
                    {trade.lookingFor && trade.lookingFor.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {trade.lookingFor.slice(0, 2).map((item, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-accent-purple/10 text-accent-purple rounded-full">
                            {item}
                          </span>
                        ))}
                        {trade.lookingFor.length > 2 && (
                          <span className="text-xs text-fg-muted">+{trade.lookingFor.length - 2} more</span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-3 border-t border-border text-sm text-fg-muted">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {trade.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {trade.saves}
                      </span>
                      <span className="ml-auto text-xs">
                        {new Date(trade.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredTrades.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-fg-muted mb-4" />
            <h3 className="text-xl font-semibold text-fg-on-canvas mb-2">No listings found</h3>
            <p className="text-fg-muted mb-6">Try adjusting your filters or create a new listing</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Listing
            </Button>
          </div>
        )}

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <CreateListingModal onClose={() => setShowCreateModal(false)} />
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
}

function CreateListingModal({ onClose }: { onClose: () => void }) {
  const [type, setType] = useState<'sell' | 'trade' | 'iso'>('sell');

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
            <h2 className="text-xl font-bold text-fg-on-canvas">Create Listing</h2>
            <button onClick={onClose} className="text-fg-muted hover:text-fg">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-fg mb-3">What do you want to do?</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'sell', label: 'Sell', icon: ShoppingBag, desc: 'List item for sale' },
                { id: 'trade', label: 'Trade', icon: Repeat, desc: 'Exchange items' },
                { id: 'iso', label: 'ISO', icon: HelpCircle, desc: 'Looking for item' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id as typeof type)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    type === t.id
                      ? 'border-accent-green bg-accent-green/10'
                      : 'border-border hover:border-fg-muted'
                  }`}
                >
                  <t.icon className={`w-6 h-6 mx-auto mb-1 ${type === t.id ? 'text-accent-green' : 'text-fg-muted'}`} />
                  <p className="font-medium text-sm text-fg">{t.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg mb-2">
              {type === 'iso' ? 'What are you looking for?' : 'Title'}
            </label>
            <input
              type="text"
              placeholder={type === 'iso' ? 'e.g., Cargo pants size M' : 'e.g., Levi\'s Denim Jacket - Size M'}
              className="w-full px-4 py-2 bg-canvas rounded-lg border border-border focus:border-accent-green focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg mb-2">Description</label>
            <textarea
              rows={3}
              placeholder="Add details about the item..."
              className="w-full px-4 py-2 bg-canvas rounded-lg border border-border focus:border-accent-green focus:outline-none resize-none"
            />
          </div>

          {/* Price (for sell) */}
          {type === 'sell' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-fg mb-2">Price (₹)</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Enter price"
                  className="flex-1 px-4 py-2 bg-canvas rounded-lg border border-border focus:border-accent-green focus:outline-none"
                />
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-fg-muted">Negotiable</span>
                </label>
              </div>
            </div>
          )}

          {/* Looking For (for trade/iso) */}
          {(type === 'trade' || type === 'iso') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-fg mb-2">
                {type === 'trade' ? 'Looking to trade for' : 'Specifications'}
              </label>
              <input
                type="text"
                placeholder="e.g., Size M, Black color, Under ₹500"
                className="w-full px-4 py-2 bg-canvas rounded-lg border border-border focus:border-accent-green focus:outline-none"
              />
            </div>
          )}

          {/* Location */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg mb-2">Your Area</label>
            <select className="w-full px-4 py-2 bg-canvas rounded-lg border border-border focus:border-accent-green focus:outline-none">
              <option>Select area...</option>
              <option>HSR Layout</option>
              <option>Koramangala</option>
              <option>Indiranagar</option>
              <option>Jayanagar</option>
              <option>Commercial Street</option>
            </select>
          </div>

          {/* Image Upload */}
          {type !== 'iso' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-fg mb-2">Photos</label>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent-green/50 transition-colors cursor-pointer">
                <Package className="w-8 h-8 mx-auto text-fg-muted mb-2" />
                <p className="text-fg-muted text-sm">Click to upload photos</p>
              </div>
            </div>
          )}

          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Create Listing
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

