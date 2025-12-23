'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Settings, Trophy, Leaf, DollarSign, 
  TrendingUp, Heart, MapPin, ShoppingBag, 
  Award, Target, Droplets, Wind, Edit2,
  ChevronRight, Star, Calendar
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

// Mock user data
const userData = {
  name: 'Priya Sharma',
  username: '@priya_thrifts',
  avatar: '👧',
  level: 12,
  xp: 2450,
  xpToNextLevel: 3000,
  title: 'Thrift Master',
  joinedDate: 'October 2023',
  stats: {
    totalSpent: 12500,
    totalSaved: 45000,
    monthlyBudget: 5000,
    monthlySpent: 3200,
    itemsThrifted: 47,
    storesVisited: 15,
    haulsPosted: 8,
    tipsShared: 12,
  },
  impact: {
    textileWasteSaved: 23.5,  // kg
    waterSaved: 126900,       // liters
    co2Saved: 169.2,          // kg
  },
  badges: [
    { id: 'first-haul', emoji: '🛍️', name: 'First Haul', date: 'Oct 2023' },
    { id: 'budget-boss', emoji: '💰', name: 'Budget Boss', date: 'Nov 2023' },
    { id: 'explorer', emoji: '🗺️', name: 'Explorer', date: 'Nov 2023' },
    { id: 'eco-warrior', emoji: '🌱', name: 'Eco Warrior', date: 'Dec 2023' },
    { id: 'helper', emoji: '💡', name: 'Helpful', date: 'Dec 2023' },
  ],
  recentActivity: [
    { type: 'haul', title: 'Posted a haul', subtitle: '₹800 outfit from Tibet Mall', date: '2 days ago' },
    { type: 'badge', title: 'Earned badge', subtitle: 'Eco Warrior 🌱', date: '5 days ago' },
    { type: 'tip', title: 'Shared a tip', subtitle: 'Restock info for Bombay Store', date: '1 week ago' },
  ],
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'impact' | 'badges'>('overview');

  const progressPercent = (userData.xp / userData.xpToNextLevel) * 100;
  const budgetPercent = (userData.stats.monthlySpent / userData.stats.monthlyBudget) * 100;

  return (
    <div className="min-h-screen bg-canvas py-8">
      <Container>
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-accent-purple/20 via-accent-blue/20 to-accent-green/20 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-canvas flex items-center justify-center text-4xl">
                {userData.avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent-green rounded-lg flex items-center justify-center text-white text-sm font-bold">
                {userData.level}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-fg-on-canvas">{userData.name}</h1>
                <span className="px-2 py-1 bg-accent-purple/20 text-accent-purple text-xs rounded-full">
                  {userData.title}
                </span>
              </div>
              <p className="text-fg-muted mb-3">{userData.username}</p>
              
              {/* XP Progress */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-fg-muted">Level {userData.level}</span>
                  <span className="text-fg">{userData.xp} / {userData.xpToNextLevel} XP</span>
                </div>
                <div className="h-2 bg-canvas rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-accent-purple to-accent-blue rounded-full"
                  />
                </div>
              </div>
              
              <p className="text-xs text-fg-muted flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Thrifting since {userData.joinedDate}
              </p>
            </div>

            {/* Actions */}
            <Button variant="secondary" size="sm">
              <Edit2 className="w-4 h-4 mr-1" />
              Edit Profile
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'impact', label: 'Impact', icon: Leaf },
            { id: 'badges', label: 'Badges', icon: Award },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-accent-green text-white'
                  : 'bg-canvas-subtle text-fg-muted hover:bg-canvas-overlay'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Budget Tracker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-canvas-subtle rounded-xl p-5 border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-fg-on-canvas flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-accent-green" />
                  Budget Tracker
                </h2>
                <span className="text-sm text-fg-muted">This Month</span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-canvas rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-fg-on-canvas">₹{userData.stats.monthlyBudget.toLocaleString()}</p>
                  <p className="text-xs text-fg-muted">Budget</p>
                </div>
                <div className="bg-canvas rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-accent-orange">₹{userData.stats.monthlySpent.toLocaleString()}</p>
                  <p className="text-xs text-fg-muted">Spent</p>
                </div>
                <div className="bg-accent-green/10 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-accent-green">₹{(userData.stats.monthlyBudget - userData.stats.monthlySpent).toLocaleString()}</p>
                  <p className="text-xs text-fg-muted">Remaining</p>
                </div>
              </div>

              {/* Budget Bar */}
              <div className="mb-2">
                <div className="h-3 bg-canvas rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(budgetPercent, 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      budgetPercent > 80 ? 'bg-accent-orange' : 'bg-accent-green'
                    }`}
                  />
                </div>
                <p className="text-xs text-fg-muted text-right mt-1">
                  {budgetPercent.toFixed(0)}% used
                </p>
              </div>

              {/* Savings Summary */}
              <div className="bg-accent-green/10 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-accent-green" />
                  <span className="font-medium text-fg">Total Lifetime Savings</span>
                </div>
                <p className="text-3xl font-bold text-accent-green">
                  ₹{userData.stats.totalSaved.toLocaleString()}
                </p>
                <p className="text-sm text-fg-muted">
                  vs retail prices • from {userData.stats.itemsThrifted} items
                </p>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {[
                { label: 'Items Thrifted', value: userData.stats.itemsThrifted, icon: ShoppingBag, color: 'text-accent-blue' },
                { label: 'Stores Visited', value: userData.stats.storesVisited, icon: MapPin, color: 'text-accent-purple' },
                { label: 'Hauls Posted', value: userData.stats.haulsPosted, icon: Heart, color: 'text-accent-pink' },
                { label: 'Tips Shared', value: userData.stats.tipsShared, icon: Star, color: 'text-accent-orange' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-canvas-subtle rounded-xl p-4 border border-border flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-lg bg-canvas flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-fg-on-canvas">{stat.value}</p>
                    <p className="text-sm text-fg-muted">{stat.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        )}

        {activeTab === 'impact' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-accent-green/20 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-accent-green" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-fg-on-canvas">Your Environmental Impact</h2>
                  <p className="text-fg-muted">By choosing thrift over fast fashion</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {/* Textile Waste */}
                <div className="bg-canvas/50 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-accent-green mb-2">
                    <ShoppingBag className="w-5 h-5" />
                    <span className="font-medium">Textile Waste Saved</span>
                  </div>
                  <p className="text-4xl font-bold text-fg-on-canvas mb-1">
                    {userData.impact.textileWasteSaved} kg
                  </p>
                  <p className="text-sm text-fg-muted">
                    ≈ {Math.round(userData.impact.textileWasteSaved / 0.2)} t-shirts worth
                  </p>
                </div>

                {/* Water Saved */}
                <div className="bg-canvas/50 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-accent-blue mb-2">
                    <Droplets className="w-5 h-5" />
                    <span className="font-medium">Water Saved</span>
                  </div>
                  <p className="text-4xl font-bold text-fg-on-canvas mb-1">
                    {(userData.impact.waterSaved / 1000).toFixed(1)}K L
                  </p>
                  <p className="text-sm text-fg-muted">
                    ≈ {Math.round(userData.impact.waterSaved / 150)} showers
                  </p>
                </div>

                {/* CO2 Saved */}
                <div className="bg-canvas/50 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-accent-purple mb-2">
                    <Wind className="w-5 h-5" />
                    <span className="font-medium">CO₂ Prevented</span>
                  </div>
                  <p className="text-4xl font-bold text-fg-on-canvas mb-1">
                    {userData.impact.co2Saved.toFixed(1)} kg
                  </p>
                  <p className="text-sm text-fg-muted">
                    ≈ {Math.round(userData.impact.co2Saved / 0.12)} km not driven
                  </p>
                </div>
              </div>
            </div>

            {/* Impact Visualization */}
            <div className="bg-canvas-subtle rounded-xl p-6 border border-border">
              <h3 className="font-semibold text-fg-on-canvas mb-4">How You're Making a Difference</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-fg-muted">Landfill Diversion</span>
                    <span className="text-accent-green">Excellent</span>
                  </div>
                  <div className="h-2 bg-canvas rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-accent-green rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-fg-muted">Water Conservation</span>
                    <span className="text-accent-blue">Great</span>
                  </div>
                  <div className="h-2 bg-canvas rounded-full overflow-hidden">
                    <div className="h-full w-[72%] bg-accent-blue rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-fg-muted">Carbon Footprint</span>
                    <span className="text-accent-purple">Good</span>
                  </div>
                  <div className="h-2 bg-canvas rounded-full overflow-hidden">
                    <div className="h-full w-[65%] bg-accent-purple rounded-full" />
                  </div>
                </div>
              </div>

              <p className="text-sm text-fg-muted mt-4 p-3 bg-canvas rounded-lg">
                💡 Every item you thrift saves approximately <strong>2,700 liters</strong> of water 
                and <strong>3.6 kg</strong> of CO₂ compared to buying new.
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'badges' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Earned Badges */}
              <div className="lg:col-span-2">
                <h3 className="font-semibold text-fg-on-canvas mb-4">Earned Badges ({userData.badges.length})</h3>
                <div className="grid grid-cols-3 gap-4">
                  {userData.badges.map(badge => (
                    <div
                      key={badge.id}
                      className="bg-canvas-subtle rounded-xl p-4 border border-accent-green/30 text-center"
                    >
                      <span className="text-4xl mb-2 block">{badge.emoji}</span>
                      <p className="font-medium text-fg text-sm">{badge.name}</p>
                      <p className="text-xs text-fg-muted">{badge.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Locked Badges */}
              <div>
                <h3 className="font-semibold text-fg-on-canvas mb-4">Locked</h3>
                <div className="space-y-3">
                  {[
                    { emoji: '👑', name: 'Thrift King', requirement: 'Post 50 hauls' },
                    { emoji: '🔥', name: 'On Fire', requirement: '7-day streak' },
                    { emoji: '🏆', name: 'Champion', requirement: 'Win a challenge' },
                  ].map((badge, i) => (
                    <div
                      key={i}
                      className="bg-canvas-subtle rounded-lg p-3 border border-border opacity-60 flex items-center gap-3"
                    >
                      <span className="text-2xl grayscale">{badge.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-fg">{badge.name}</p>
                        <p className="text-xs text-fg-muted">{badge.requirement}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </Container>
    </div>
  );
}

