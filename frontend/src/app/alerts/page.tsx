'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Plus, X, Tag, MapPin, DollarSign, 
  Shirt, Clock, Trash2, ToggleLeft, ToggleRight,
  Sparkles, TrendingDown, Package, Zap
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

interface Alert {
  id: string;
  type: 'price_drop' | 'restock' | 'new_store' | 'flash_sale' | 'size_available';
  name: string;
  criteria: {
    query?: string;
    maxPrice?: number;
    locations?: string[];
    categories?: string[];
    sizes?: string[];
  };
  isActive: boolean;
  matchCount: number;
  lastTriggered?: string;
}

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'price_drop',
    name: 'Denim Jackets under ₹500',
    criteria: { query: 'denim jacket', maxPrice: 500 },
    isActive: true,
    matchCount: 3,
    lastTriggered: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    type: 'restock',
    name: 'Tibet Mall Restocks',
    criteria: { locations: ['central'] },
    isActive: true,
    matchCount: 1,
  },
  {
    id: '3',
    type: 'size_available',
    name: 'Size M Cargo Pants',
    criteria: { query: 'cargo pants', sizes: ['M'] },
    isActive: false,
    matchCount: 0,
  },
];

const alertTypes = [
  { id: 'price_drop', name: 'Price Drop', icon: TrendingDown, color: 'text-accent-green', description: 'When items drop below your target price' },
  { id: 'restock', name: 'Restock Alert', icon: Package, color: 'text-accent-blue', description: 'When your favorite stores get new stock' },
  { id: 'new_store', name: 'New Store', icon: MapPin, color: 'text-accent-purple', description: 'New thrift stores in your area' },
  { id: 'flash_sale', name: 'Flash Sale', icon: Zap, color: 'text-accent-orange', description: 'Limited time deals and sales' },
  { id: 'size_available', name: 'Size Available', icon: Shirt, color: 'text-accent-pink', description: 'When your size is spotted' },
];

const locations = [
  { id: 'hsr-layout', name: 'HSR Layout' },
  { id: 'koramangala', name: 'Koramangala' },
  { id: 'central', name: 'Commercial Street' },
  { id: 'indiranagar', name: 'Indiranagar' },
  { id: 'jayanagar', name: 'Jayanagar' },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const getAlertIcon = (type: string) => {
    const alertType = alertTypes.find(t => t.id === type);
    return alertType?.icon || Bell;
  };

  const getAlertColor = (type: string) => {
    const alertType = alertTypes.find(t => t.id === type);
    return alertType?.color || 'text-fg';
  };

  return (
    <div className="min-h-screen bg-canvas py-8">
      <Container>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-fg-on-canvas mb-2">
              Price Alerts 🔔
            </h1>
            <p className="text-fg-muted">
              Never miss a deal. Get notified instantly.
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Alert
          </Button>
        </div>

        {/* Alert Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-canvas-subtle rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-green/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-accent-green" />
              </div>
              <div>
                <p className="text-2xl font-bold text-fg-on-canvas">
                  {alerts.filter(a => a.isActive).length}
                </p>
                <p className="text-sm text-fg-muted">Active Alerts</p>
              </div>
            </div>
          </div>
          <div className="bg-canvas-subtle rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-blue/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-accent-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold text-fg-on-canvas">
                  {alerts.reduce((sum, a) => sum + a.matchCount, 0)}
                </p>
                <p className="text-sm text-fg-muted">Total Matches</p>
              </div>
            </div>
          </div>
          <div className="bg-canvas-subtle rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-purple/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold text-fg-on-canvas">Instant</p>
                <p className="text-sm text-fg-muted">Notification Speed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          <AnimatePresence>
            {alerts.map((alert, index) => {
              const Icon = getAlertIcon(alert.type);
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-canvas-subtle rounded-xl p-5 border transition-all ${
                    alert.isActive ? 'border-accent-green/30' : 'border-border opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      alert.isActive ? 'bg-canvas-overlay' : 'bg-canvas'
                    }`}>
                      <Icon className={`w-6 h-6 ${getAlertColor(alert.type)}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-fg-on-canvas">{alert.name}</h3>
                        {alert.matchCount > 0 && (
                          <span className="px-2 py-0.5 bg-accent-green/20 text-accent-green text-xs rounded-full">
                            {alert.matchCount} matches
                          </span>
                        )}
                      </div>

                      {/* Criteria Tags */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {alert.criteria.query && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-canvas rounded-lg text-xs text-fg-muted">
                            <Tag className="w-3 h-3" />
                            {alert.criteria.query}
                          </span>
                        )}
                        {alert.criteria.maxPrice && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-canvas rounded-lg text-xs text-fg-muted">
                            <DollarSign className="w-3 h-3" />
                            Under ₹{alert.criteria.maxPrice}
                          </span>
                        )}
                        {alert.criteria.locations?.map(loc => (
                          <span key={loc} className="flex items-center gap-1 px-2 py-1 bg-canvas rounded-lg text-xs text-fg-muted">
                            <MapPin className="w-3 h-3" />
                            {locations.find(l => l.id === loc)?.name || loc}
                          </span>
                        ))}
                        {alert.criteria.sizes?.map(size => (
                          <span key={size} className="flex items-center gap-1 px-2 py-1 bg-canvas rounded-lg text-xs text-fg-muted">
                            <Shirt className="w-3 h-3" />
                            Size {size}
                          </span>
                        ))}
                      </div>

                      {alert.lastTriggered && (
                        <p className="text-xs text-fg-muted mt-2">
                          Last triggered: {new Date(alert.lastTriggered).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAlert(alert.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          alert.isActive 
                            ? 'text-accent-green hover:bg-accent-green/10' 
                            : 'text-fg-muted hover:bg-canvas'
                        }`}
                      >
                        {alert.isActive ? (
                          <ToggleRight className="w-6 h-6" />
                        ) : (
                          <ToggleLeft className="w-6 h-6" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteAlert(alert.id)}
                        className="p-2 rounded-lg text-fg-muted hover:text-accent-orange hover:bg-accent-orange/10 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {alerts.length === 0 && (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 mx-auto text-fg-muted mb-4" />
            <h3 className="text-xl font-semibold text-fg-on-canvas mb-2">No alerts yet</h3>
            <p className="text-fg-muted mb-6">Create your first alert to never miss a deal</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Alert
            </Button>
          </div>
        )}

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <CreateAlertModal 
              onClose={() => setShowCreateModal(false)}
              onCreate={(alert) => {
                setAlerts([...alerts, { ...alert, id: Date.now().toString(), matchCount: 0, isActive: true }]);
                setShowCreateModal(false);
              }}
            />
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
}

function CreateAlertModal({ 
  onClose, 
  onCreate 
}: { 
  onClose: () => void;
  onCreate: (alert: Omit<Alert, 'id' | 'matchCount' | 'isActive'>) => void;
}) {
  const [selectedType, setSelectedType] = useState<string>('price_drop');
  const [query, setQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const handleCreate = () => {
    onCreate({
      type: selectedType as Alert['type'],
      name: query || alertTypes.find(t => t.id === selectedType)?.name || 'Alert',
      criteria: {
        query: query || undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        locations: selectedLocations.length > 0 ? selectedLocations : undefined,
        sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
      },
    });
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
            <h2 className="text-xl font-bold text-fg-on-canvas">Create Alert</h2>
            <button onClick={onClose} className="text-fg-muted hover:text-fg">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Alert Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-fg mb-3">Alert Type</label>
            <div className="grid grid-cols-2 gap-2">
              {alertTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedType === type.id
                        ? 'border-accent-green bg-accent-green/10'
                        : 'border-border hover:border-fg-muted'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${type.color}`} />
                    <p className="font-medium text-sm text-fg">{type.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Query */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg mb-2">
              What are you looking for?
            </label>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g., vintage denim jacket"
              className="w-full px-4 py-2 bg-canvas rounded-lg border border-border focus:border-accent-green focus:outline-none"
            />
          </div>

          {/* Max Price */}
          {selectedType === 'price_drop' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-fg mb-2">
                Max Price (₹)
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                placeholder="500"
                className="w-full px-4 py-2 bg-canvas rounded-lg border border-border focus:border-accent-green focus:outline-none"
              />
            </div>
          )}

          {/* Locations */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-fg mb-2">
              Locations (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {locations.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => {
                    setSelectedLocations(prev => 
                      prev.includes(loc.id) 
                        ? prev.filter(l => l !== loc.id)
                        : [...prev, loc.id]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    selectedLocations.includes(loc.id)
                      ? 'bg-accent-green text-white'
                      : 'bg-canvas border border-border text-fg-muted hover:border-fg-muted'
                  }`}
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          {selectedType === 'size_available' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-fg mb-2">
                Sizes
              </label>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSizes(prev => 
                        prev.includes(size) 
                          ? prev.filter(s => s !== size)
                          : [...prev, size]
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      selectedSizes.includes(size)
                        ? 'bg-accent-green text-white'
                        : 'bg-canvas border border-border text-fg-muted hover:border-fg-muted'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Create Button */}
          <Button onClick={handleCreate} className="w-full mt-4">
            <Bell className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

