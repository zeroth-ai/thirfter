'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Clock, Users, Sparkles, Medal, 
  DollarSign, Shirt, Palette, Target, Crown,
  ChevronRight, CheckCircle, Star
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'budget' | 'category' | 'creative' | 'weekly';
  criteria: {
    maxBudget?: number;
    theme?: string;
    requiredItems?: string[];
  };
  rewards: {
    xp: number;
    badge?: string;
    title?: string;
  };
  startDate: string;
  endDate: string;
  participantCount: number;
  isFeatured: boolean;
  submissions: {
    user: { name: string; avatar?: string };
    totalSpent: number;
    votes: number;
  }[];
}

const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: '₹500 Full Outfit Challenge 💪',
    description: 'Create a complete outfit (top, bottom, accessory) for under ₹500. Show us your thrifting skills!',
    type: 'budget',
    criteria: { maxBudget: 500 },
    rewards: { xp: 200, badge: '💰', title: 'Budget Boss' },
    startDate: '2024-01-15',
    endDate: '2024-01-22',
    participantCount: 47,
    isFeatured: true,
    submissions: [
      { user: { name: 'Priya S.', avatar: '👧' }, totalSpent: 450, votes: 23 },
      { user: { name: 'Arjun M.', avatar: '🧑' }, totalSpent: 380, votes: 18 },
      { user: { name: 'Sneha K.', avatar: '👩' }, totalSpent: 495, votes: 15 },
    ],
  },
  {
    id: '2',
    title: 'Y2K Revival Challenge 📼',
    description: 'Find the best Y2K pieces - low-rise, butterfly clips, baby tees, anything 2000s!',
    type: 'creative',
    criteria: { theme: 'Y2K' },
    rewards: { xp: 150, badge: '📼', title: 'Time Traveler' },
    startDate: '2024-01-18',
    endDate: '2024-01-25',
    participantCount: 32,
    isFeatured: false,
    submissions: [],
  },
  {
    id: '3',
    title: 'Denim Only Week 👖',
    description: 'This week, post only denim finds - jackets, jeans, shirts, anything denim!',
    type: 'category',
    criteria: { requiredItems: ['denim'] },
    rewards: { xp: 100, badge: '👖' },
    startDate: '2024-01-20',
    endDate: '2024-01-27',
    participantCount: 28,
    isFeatured: false,
    submissions: [],
  },
];

const pastWinners = [
  { challenge: 'Winter Jacket Hunt', winner: 'Rahul K.', prize: 'Jacket King 👑', date: 'Jan 10' },
  { challenge: '₹300 Challenge', winner: 'Meera R.', prize: 'Super Saver 💫', date: 'Jan 5' },
];

export default function ChallengesPage() {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const featuredChallenge = mockChallenges.find(c => c.isFeatured);
  const otherChallenges = mockChallenges.filter(c => !c.isFeatured);

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'budget': return DollarSign;
      case 'category': return Shirt;
      case 'creative': return Palette;
      default: return Target;
    }
  };

  return (
    <div className="min-h-screen bg-canvas py-8">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-fg-on-canvas mb-2">
            Thrift Challenges 🏆
          </h1>
          <p className="text-fg-muted">
            Compete, win badges, and flex your thrifting skills!
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active Challenges', value: mockChallenges.length, icon: Target, color: 'text-accent-green' },
            { label: 'Total Participants', value: mockChallenges.reduce((sum, c) => sum + c.participantCount, 0), icon: Users, color: 'text-accent-blue' },
            { label: 'Your Badges', value: 3, icon: Medal, color: 'text-accent-orange' },
            { label: 'Your Rank', value: '#12', icon: Trophy, color: 'text-accent-purple' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-canvas-subtle rounded-xl p-4 border border-border"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <p className="text-2xl font-bold text-fg-on-canvas">{stat.value}</p>
              <p className="text-sm text-fg-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Featured Challenge */}
        {featuredChallenge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-accent-orange" />
              <h2 className="text-xl font-semibold text-fg-on-canvas">Featured Challenge</h2>
            </div>
            
            <div className="bg-gradient-to-r from-accent-purple/20 via-accent-pink/20 to-accent-orange/20 rounded-2xl p-6 border border-accent-purple/30">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-accent-orange/20 text-accent-orange text-xs rounded-full font-medium">
                      🔥 HOT
                    </span>
                    <span className="flex items-center gap-1 text-sm text-fg-muted">
                      <Clock className="w-4 h-4" />
                      {getDaysLeft(featuredChallenge.endDate)} days left
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-fg-on-canvas mb-2">
                    {featuredChallenge.title}
                  </h3>
                  <p className="text-fg-muted">{featuredChallenge.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-accent-green">
                    +{featuredChallenge.rewards.xp} XP
                  </p>
                  {featuredChallenge.rewards.badge && (
                    <p className="text-lg">{featuredChallenge.rewards.badge}</p>
                  )}
                </div>
              </div>

              {/* Leaderboard Preview */}
              <div className="bg-canvas/50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-fg">Current Leaderboard</span>
                  <span className="text-sm text-fg-muted">{featuredChallenge.participantCount} participants</span>
                </div>
                <div className="space-y-2">
                  {featuredChallenge.submissions.slice(0, 3).map((sub, i) => (
                    <div key={i} className="flex items-center gap-3 bg-canvas rounded-lg p-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? 'bg-yellow-500 text-black' :
                        i === 1 ? 'bg-gray-400 text-black' :
                        'bg-amber-700 text-white'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center">
                        {sub.user.avatar || sub.user.name[0]}
                      </div>
                      <span className="flex-1 font-medium text-fg">{sub.user.name}</span>
                      <span className="text-sm text-fg-muted">₹{sub.totalSpent}</span>
                      <span className="text-sm text-accent-pink">❤️ {sub.votes}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full">
                <Trophy className="w-4 h-4 mr-2" />
                Join Challenge
              </Button>
            </div>
          </motion.div>
        )}

        {/* Other Active Challenges */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-fg-on-canvas mb-4">Active Challenges</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {otherChallenges.map((challenge, i) => {
              const Icon = getChallengeIcon(challenge.type);
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-canvas-subtle rounded-xl p-5 border border-border hover:border-accent-green/50 transition-all cursor-pointer"
                  onClick={() => setSelectedChallenge(challenge)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-canvas flex items-center justify-center">
                      <Icon className="w-6 h-6 text-accent-blue" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-fg-on-canvas">{challenge.title}</h3>
                      </div>
                      <p className="text-sm text-fg-muted line-clamp-2 mb-3">
                        {challenge.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-fg-muted">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {challenge.participantCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {getDaysLeft(challenge.endDate)}d left
                          </span>
                        </div>
                        <span className="text-accent-green font-medium">
                          +{challenge.rewards.xp} XP
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-fg-muted" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Past Winners */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-fg-on-canvas mb-4">Hall of Fame 🏅</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {pastWinners.map((winner, i) => (
              <div
                key={i}
                className="bg-canvas-subtle rounded-xl p-4 border border-border flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-fg">{winner.winner}</p>
                  <p className="text-sm text-fg-muted">{winner.challenge}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg">{winner.prize}</p>
                  <p className="text-xs text-fg-muted">{winner.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Badges */}
        <div>
          <h2 className="text-xl font-semibold text-fg-on-canvas mb-4">Your Badges</h2>
          <div className="flex flex-wrap gap-4">
            {[
              { emoji: '🛍️', name: 'First Haul', earned: true },
              { emoji: '💰', name: 'Budget Boss', earned: true },
              { emoji: '🔥', name: 'On Fire', earned: true },
              { emoji: '👑', name: 'Thrift King', earned: false },
              { emoji: '🌱', name: 'Eco Warrior', earned: false },
              { emoji: '🗺️', name: 'Explorer', earned: false },
            ].map((badge, i) => (
              <div
                key={i}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${
                  badge.earned 
                    ? 'bg-canvas-subtle border-accent-green/30' 
                    : 'bg-canvas border-border opacity-40'
                }`}
              >
                <span className="text-3xl">{badge.emoji}</span>
                <span className="text-xs text-fg-muted">{badge.name}</span>
                {badge.earned && (
                  <CheckCircle className="w-4 h-4 text-accent-green" />
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

