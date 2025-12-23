'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, X, MapPin, Calendar, Clock, 
  MessageCircle, CheckCircle, UserPlus, Route,
  ChevronRight, Heart
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

interface Trip {
  id: string;
  creator: { name: string; avatar?: string };
  title: string;
  description?: string;
  date: string;
  startTime: string;
  meetingPoint: { name: string; address: string };
  stores: { name: string; location: string }[];
  participants: { name: string; status: 'going' | 'maybe' | 'invited' }[];
  sharedWishlist: string[];
  isPublic: boolean;
  maxParticipants: number;
}

const mockTrips: Trip[] = [
  {
    id: '1',
    creator: { name: 'Priya S.', avatar: '👧' },
    title: 'Saturday HSR Thrift Crawl 🛍️',
    description: 'Hitting all the best surplus stores in HSR! Join us for some amazing finds.',
    date: '2024-01-20',
    startTime: '10:00 AM',
    meetingPoint: { name: 'HSR BDA Complex', address: 'Sector 7, HSR Layout' },
    stores: [
      { name: 'Bombay Store', location: 'HSR Layout' },
      { name: 'Brand Factory Surplus', location: 'HSR Layout' },
      { name: 'Cotton World Outlet', location: 'HSR Layout' },
    ],
    participants: [
      { name: 'Priya S.', status: 'going' },
      { name: 'Rahul K.', status: 'going' },
      { name: 'Sneha M.', status: 'maybe' },
    ],
    sharedWishlist: ['Denim jacket M/L', 'Cargo pants', 'Vintage tees'],
    isPublic: true,
    maxParticipants: 8,
  },
  {
    id: '2',
    creator: { name: 'Arjun M.', avatar: '🧑' },
    title: 'Commercial Street Deep Dive',
    description: 'Exploring the hidden gems of Commercial Street. Bring your haggling skills!',
    date: '2024-01-21',
    startTime: '11:00 AM',
    meetingPoint: { name: 'Cauvery Emporium', address: 'MG Road' },
    stores: [
      { name: 'Tibet Mall', location: 'Commercial Street' },
      { name: 'Fashion Street', location: 'Commercial Street' },
    ],
    participants: [
      { name: 'Arjun M.', status: 'going' },
      { name: 'Meera R.', status: 'going' },
    ],
    sharedWishlist: ['Winter jackets', 'Leather bags'],
    isPublic: true,
    maxParticipants: 6,
  },
];

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [viewMode, setViewMode] = useState<'upcoming' | 'my'>('upcoming');

  const handleJoinTrip = (tripId: string) => {
    setTrips(trips.map(trip => {
      if (trip.id === tripId) {
        return {
          ...trip,
          participants: [...trip.participants, { name: 'You', status: 'going' as const }],
        };
      }
      return trip;
    }));
  };

  return (
    <div className="min-h-screen bg-canvas py-8">
      <Container>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-fg-on-canvas mb-2">
              Group Thrift Trips 👥
            </h1>
            <p className="text-fg-muted">
              Shop together, find more, have fun!
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Plan Trip
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('upcoming')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'upcoming'
                ? 'bg-accent-green text-white'
                : 'bg-canvas-subtle text-fg-muted hover:bg-canvas-overlay'
            }`}
          >
            Public Trips
          </button>
          <button
            onClick={() => setViewMode('my')}
            className={`px-4 py-2 rounded-lg transition-all ${
              viewMode === 'my'
                ? 'bg-accent-green text-white'
                : 'bg-canvas-subtle text-fg-muted hover:bg-canvas-overlay'
            }`}
          >
            My Trips
          </button>
        </div>

        {/* Trips List */}
        <div className="space-y-4">
          <AnimatePresence>
            {trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-canvas-subtle rounded-xl overflow-hidden border border-border hover:border-accent-green/50 transition-all"
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center">
                        {trip.creator.avatar || trip.creator.name[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-fg-on-canvas">{trip.title}</h3>
                        <p className="text-sm text-fg-muted">by {trip.creator.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-fg">
                        {new Date(trip.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-sm text-fg-muted">{trip.startTime}</p>
                    </div>
                  </div>

                  {trip.description && (
                    <p className="text-fg-muted text-sm mb-4">{trip.description}</p>
                  )}

                  {/* Info Row */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-fg-muted">
                      <MapPin className="w-4 h-4 text-accent-blue" />
                      {trip.meetingPoint.name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-fg-muted">
                      <Route className="w-4 h-4 text-accent-green" />
                      {trip.stores.length} stores
                    </div>
                    <div className="flex items-center gap-2 text-sm text-fg-muted">
                      <Users className="w-4 h-4 text-accent-purple" />
                      {trip.participants.filter(p => p.status === 'going').length}/{trip.maxParticipants} going
                    </div>
                  </div>

                  {/* Stores Preview */}
                  <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                    {trip.stores.map((store, i) => (
                      <div key={i} className="flex items-center gap-1 px-3 py-1 bg-canvas rounded-full whitespace-nowrap">
                        <span className="text-sm text-fg">{store.name}</span>
                        {i < trip.stores.length - 1 && (
                          <ChevronRight className="w-4 h-4 text-fg-muted" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Participants */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {trip.participants.slice(0, 5).map((p, i) => (
                        <div
                          key={i}
                          className={`w-8 h-8 rounded-full border-2 border-canvas-subtle flex items-center justify-center text-xs ${
                            p.status === 'going' ? 'bg-accent-green/20' : 'bg-canvas'
                          }`}
                          title={`${p.name} - ${p.status}`}
                        >
                          {p.name[0]}
                        </div>
                      ))}
                      {trip.participants.length > 5 && (
                        <div className="w-8 h-8 rounded-full border-2 border-canvas-subtle bg-canvas-overlay flex items-center justify-center text-xs text-fg-muted">
                          +{trip.participants.length - 5}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedTrip(trip)}
                      >
                        View Details
                      </Button>
                      {!trip.participants.some(p => p.name === 'You') && (
                        <Button
                          size="sm"
                          onClick={() => handleJoinTrip(trip.id)}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Join
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shared Wishlist Preview */}
                {trip.sharedWishlist.length > 0 && (
                  <div className="px-5 py-3 bg-canvas border-t border-border">
                    <p className="text-xs text-fg-muted mb-2">Group looking for:</p>
                    <div className="flex flex-wrap gap-1">
                      {trip.sharedWishlist.map((item, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-accent-blue/10 text-accent-blue rounded-full"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {trips.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 mx-auto text-fg-muted mb-4" />
            <h3 className="text-xl font-semibold text-fg-on-canvas mb-2">No trips planned</h3>
            <p className="text-fg-muted mb-6">Be the first to plan a group thrift trip!</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Plan Trip
            </Button>
          </div>
        )}

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <CreateTripModal onClose={() => setShowCreateModal(false)} />
          )}
        </AnimatePresence>

        {/* Trip Detail Modal */}
        <AnimatePresence>
          {selectedTrip && (
            <TripDetailModal trip={selectedTrip} onClose={() => setSelectedTrip(null)} />
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
}

function CreateTripModal({ onClose }: { onClose: () => void }) {
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
            <h2 className="text-xl font-bold text-fg-on-canvas">Plan a Trip</h2>
            <button onClick={onClose} className="text-fg-muted hover:text-fg">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-fg mb-2">Trip Title</label>
              <input
                type="text"
                placeholder="e.g., Weekend Koramangala Thrift Crawl"
                className="w-full px-4 py-2 bg-canvas rounded-lg border border-border focus:border-accent-green focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-fg mb-2">Description</label>
              <textarea
                placeholder="What's the plan?"
                rows={3}
                className="w-full px-4 py-2 bg-canvas rounded-lg border border-border focus:border-accent-green focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-fg mb-2">Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-canvas rounded-lg border border-border focus:border-accent-green focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg mb-2">Time</label>
                <input
                  type="time"
                  className="w-full px-4 py-2 bg-canvas rounded-lg border border-border focus:border-accent-green focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-fg mb-2">Meeting Point</label>
              <input
                type="text"
                placeholder="e.g., HSR BDA Complex"
                className="w-full px-4 py-2 bg-canvas rounded-lg border border-border focus:border-accent-green focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-fg mb-2">Stores to Visit</label>
              <input
                type="text"
                placeholder="Add stores (comma separated)"
                className="w-full px-4 py-2 bg-canvas rounded-lg border border-border focus:border-accent-green focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-fg">Make public (others can join)</span>
              </label>
            </div>
          </div>

          <Button className="w-full mt-6">
            <Calendar className="w-4 h-4 mr-2" />
            Create Trip
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function TripDetailModal({ trip, onClose }: { trip: Trip; onClose: () => void }) {
  const [message, setMessage] = useState('');
  const [wishlistItem, setWishlistItem] = useState('');

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
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-fg-on-canvas">{trip.title}</h2>
            <button onClick={onClose} className="text-fg-muted hover:text-fg">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Trip Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-canvas rounded-lg p-4">
              <div className="flex items-center gap-2 text-fg-muted mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Date & Time</span>
              </div>
              <p className="font-medium text-fg">
                {new Date(trip.date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <p className="text-fg-muted">{trip.startTime}</p>
            </div>
            <div className="bg-canvas rounded-lg p-4">
              <div className="flex items-center gap-2 text-fg-muted mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Meeting Point</span>
              </div>
              <p className="font-medium text-fg">{trip.meetingPoint.name}</p>
              <p className="text-fg-muted text-sm">{trip.meetingPoint.address}</p>
            </div>
          </div>

          {/* Route */}
          <div className="mb-6">
            <h3 className="font-semibold text-fg mb-3 flex items-center gap-2">
              <Route className="w-4 h-4 text-accent-green" />
              Route ({trip.stores.length} stores)
            </h3>
            <div className="space-y-2">
              {trip.stores.map((store, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent-green/20 flex items-center justify-center text-xs text-accent-green font-medium">
                    {i + 1}
                  </div>
                  <div className="flex-1 bg-canvas rounded-lg p-3">
                    <p className="font-medium text-fg">{store.name}</p>
                    <p className="text-sm text-fg-muted">{store.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Participants */}
          <div className="mb-6">
            <h3 className="font-semibold text-fg mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-accent-purple" />
              Participants ({trip.participants.filter(p => p.status === 'going').length}/{trip.maxParticipants})
            </h3>
            <div className="flex flex-wrap gap-2">
              {trip.participants.map((p, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    p.status === 'going' ? 'bg-accent-green/10' : 'bg-canvas'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-canvas-overlay flex items-center justify-center text-xs">
                    {p.name[0]}
                  </div>
                  <span className="text-sm text-fg">{p.name}</span>
                  {p.status === 'going' && (
                    <CheckCircle className="w-4 h-4 text-accent-green" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Shared Wishlist */}
          <div className="mb-6">
            <h3 className="font-semibold text-fg mb-3 flex items-center gap-2">
              <Heart className="w-4 h-4 text-accent-pink" />
              Group Wishlist
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {trip.sharedWishlist.map((item, i) => (
                <span key={i} className="px-3 py-1 bg-accent-pink/10 text-accent-pink rounded-full text-sm">
                  {item}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={wishlistItem}
                onChange={e => setWishlistItem(e.target.value)}
                placeholder="Add to wishlist..."
                className="flex-1 px-3 py-2 bg-canvas rounded-lg border border-border focus:border-accent-green focus:outline-none text-sm"
              />
              <Button size="sm">Add</Button>
            </div>
          </div>

          {/* Group Chat Preview */}
          <div>
            <h3 className="font-semibold text-fg mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-accent-blue" />
              Group Chat
            </h3>
            <div className="bg-canvas rounded-lg p-4 mb-3 h-32 overflow-y-auto">
              <p className="text-center text-fg-muted text-sm">No messages yet. Say hi! 👋</p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-canvas rounded-lg border border-border focus:border-accent-green focus:outline-none text-sm"
              />
              <Button size="sm">Send</Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

