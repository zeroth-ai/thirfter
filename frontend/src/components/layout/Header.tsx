'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Menu, X, User, Bell, Heart, 
  ShoppingBag, Users, Trophy, MapPin,
  Compass, LogOut, Settings, ChevronDown,
  Sparkles, Store, TrendingUp
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

const mainNav = [
  { href: '/', label: 'Home', icon: Store },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/hauls', label: 'Hauls', icon: Sparkles },
  { href: '/marketplace', label: 'Trade', icon: ShoppingBag },
];

const moreNav = [
  { href: '/trips', label: 'Group Trips', icon: Users, description: 'Plan thrift trips with friends' },
  { href: '/challenges', label: 'Challenges', icon: Trophy, description: 'Compete and win badges' },
  { href: '/alerts', label: 'Price Alerts', icon: Bell, description: 'Never miss a deal' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Mock auth state
  const isLoggedIn = true;
  const user = { name: 'Priya', avatar: '👧', level: 12 };

  return (
    <header className="sticky top-0 z-50 bg-canvas/80 backdrop-blur-xl border-b border-border">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-green to-accent-blue flex items-center justify-center">
              <span className="text-white font-bold text-sm">BT</span>
            </div>
            <span className="font-bold text-fg-on-canvas hidden sm:block group-hover:text-accent-green transition-colors">
              BLR Thrifter
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {mainNav.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-accent-green/10 text-accent-green'
                      : 'text-fg-muted hover:text-fg hover:bg-canvas-subtle'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* More Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                onBlur={() => setTimeout(() => setMoreMenuOpen(false), 200)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all text-fg-muted hover:text-fg hover:bg-canvas-subtle`}
              >
                <span className="text-sm font-medium">More</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {moreMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 w-64 bg-canvas-subtle rounded-xl border border-border shadow-lg overflow-hidden"
                  >
                    {moreNav.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-start gap-3 p-3 hover:bg-canvas-overlay transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-canvas flex items-center justify-center mt-0.5">
                          <item.icon className="w-4 h-4 text-accent-blue" />
                        </div>
                        <div>
                          <p className="font-medium text-fg text-sm">{item.label}</p>
                          <p className="text-xs text-fg-muted">{item.description}</p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Link
              href="/search"
              className="p-2 rounded-lg text-fg-muted hover:text-fg hover:bg-canvas-subtle transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            {isLoggedIn ? (
              <>
                {/* Notifications */}
                <Link
                  href="/alerts"
                  className="relative p-2 rounded-lg text-fg-muted hover:text-fg hover:bg-canvas-subtle transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-accent-orange rounded-full" />
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                    className="flex items-center gap-2 p-1 pr-3 rounded-full bg-canvas-subtle hover:bg-canvas-overlay transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center">
                      {user.avatar}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-fg">{user.name}</p>
                      <p className="text-xs text-fg-muted">Level {user.level}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-fg-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full right-0 mt-2 w-56 bg-canvas-subtle rounded-xl border border-border shadow-lg overflow-hidden"
                      >
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 p-3 hover:bg-canvas-overlay transition-colors"
                        >
                          <User className="w-4 h-4 text-fg-muted" />
                          <span className="text-sm text-fg">Profile & Stats</span>
                        </Link>
                        <Link
                          href="/profile?tab=impact"
                          className="flex items-center gap-3 p-3 hover:bg-canvas-overlay transition-colors"
                        >
                          <TrendingUp className="w-4 h-4 text-accent-green" />
                          <span className="text-sm text-fg">Impact Dashboard</span>
                        </Link>
                        <Link
                          href="/favorites"
                          className="flex items-center gap-3 p-3 hover:bg-canvas-overlay transition-colors"
                        >
                          <Heart className="w-4 h-4 text-accent-pink" />
                          <span className="text-sm text-fg">Saved Stores</span>
                        </Link>
                        <div className="border-t border-border my-1" />
                        <Link
                          href="/settings"
                          className="flex items-center gap-3 p-3 hover:bg-canvas-overlay transition-colors"
                        >
                          <Settings className="w-4 h-4 text-fg-muted" />
                          <span className="text-sm text-fg">Settings</span>
                        </Link>
                        <button className="w-full flex items-center gap-3 p-3 hover:bg-canvas-overlay transition-colors text-accent-orange">
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="secondary" size="sm">Log In</Button>
                </Link>
                <Link href="/signup" className="hidden sm:block">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-fg-muted hover:text-fg hover:bg-canvas-subtle transition-colors md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border overflow-hidden"
          >
            <Container>
              <nav className="py-4 space-y-1">
                {[...mainNav, ...moreNav].map(item => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-accent-green/10 text-accent-green'
                          : 'text-fg-muted hover:text-fg hover:bg-canvas-subtle'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
