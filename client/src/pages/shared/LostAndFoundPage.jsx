import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Search,
  Filter,
  PlusCircle,
  MapPin,
  Calendar,
  Phone,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  Tag,
  Clock,
  ArrowRight,
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  Check,
  MessageCircle,
  Layers,
  HelpCircle,
  Trash2,
  ExternalLink,
  Cpu,
  Radio,
  Zap,
} from 'lucide-react';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/axiosInstance';
import { cn } from '../../utils/cn';

const CATEGORIES = [
  'Electronics',
  'Wallets & IDs',
  'Keys',
  'Bags & Luggage',
  'Books & Stationery',
  'Clothing & Accessories',
  'Bottles & Containers',
  'Other',
];

const CAMPUS_BUILDINGS = [
  'Central Library',
  'Block A (Main Admin)',
  'Block B (Science)',
  'Block C (Engineering)',
  'Block D (Humanities)',
  'Hostel Block 1',
  'Hostel Block 2',
  'Sports Complex & Gym',
  'Central Cafeteria',
  'Auditorium',
  'Main Gate & Parking Area',
  'Other Campus Location',
];

export const LostAndFoundPage = () => {
  const { user } = useAuthStore();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    openLostCount: 0,
    openFoundCount: 0,
    claimedCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'lost', 'found', 'claimed'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState('lost'); // 'lost' | 'found'
  const [activeItemDetails, setActiveItemDetails] = useState(null);

  // Report Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    building: 'Central Library',
    specificSpot: '',
    description: '',
    itemDate: new Date().toISOString().split('T')[0],
    contactName: user?.name || '',
    contactPhone: user?.phoneNumber || '',
    contactEmail: user?.email || '',
    handoverLocation: '',
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessToast, setActionSuccessToast] = useState('');

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/lost-found');
      setItems(res.items || []);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load lost and found items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const triggerToast = (msg) => {
    setActionSuccessToast(msg);
    setTimeout(() => setActionSuccessToast(''), 4000);
  };

  // Filtered items list
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Tab filter
      if (selectedTab === 'lost') {
        if (item.type !== 'lost' || item.status !== 'open') return false;
      } else if (selectedTab === 'found') {
        if (item.type !== 'found' || item.status !== 'open') return false;
      } else if (selectedTab === 'claimed') {
        if (item.status !== 'claimed') return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // 3. Building filter
      if (selectedBuilding !== 'all' && item.location?.building !== selectedBuilding) {
        return false;
      }

      // 4. Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        const matchBuilding = item.location?.building?.toLowerCase().includes(q);
        const matchSpot = item.location?.specificSpot?.toLowerCase().includes(q);
        const matchContact = item.contact?.name?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchBuilding && !matchSpot && !matchContact) {
          return false;
        }
      }

      return true;
    });
  }, [items, selectedTab, selectedCategory, selectedBuilding, searchQuery]);

  // Handle Image File Selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeSelectedImage = () => {
    setSelectedImageFile(null);
    setImagePreviewUrl('');
  };

  // Open Report Modal with default type
  const openReportModal = (type) => {
    setReportType(type);
    setFormData({
      title: '',
      category: 'Electronics',
      building: 'Central Library',
      specificSpot: '',
      description: '',
      itemDate: new Date().toISOString().split('T')[0],
      contactName: user?.name || '',
      contactPhone: user?.phoneNumber || '',
      contactEmail: user?.email || '',
      handoverLocation: type === 'found' ? 'Handed over to Campus Security Desk' : '',
    });
    setSelectedImageFile(null);
    setImagePreviewUrl('');
    setIsReportModalOpen(true);
  };

  // Submit Lost/Found Form
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please provide an item title');
      return;
    }
    if (!formData.contactPhone.trim()) {
      alert('Please provide a contact phone number');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('type', reportType);
      payload.append('title', formData.title.trim());
      payload.append('category', formData.category);
      payload.append('building', formData.building);
      payload.append('specificSpot', formData.specificSpot.trim());
      payload.append('description', formData.description.trim());
      payload.append('itemDate', formData.itemDate);
      payload.append('contactName', formData.contactName.trim());
      payload.append('contactPhone', formData.contactPhone.trim());
      payload.append('contactEmail', formData.contactEmail.trim());
      payload.append('handoverLocation', formData.handoverLocation.trim());

      if (selectedImageFile) {
        payload.append('image', selectedImageFile);
      }

      const res = await api.post('/lost-found', payload);
      triggerToast(res.message || 'Item listed successfully!');
      setIsReportModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error('Failed to submit report:', err);
      alert(err.message || 'Error publishing listing. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mark Item as Claimed / Reunited
  const handleToggleStatus = async (item, targetStatus) => {
    try {
      const res = await api.patch(`/lost-found/${item._id}/status`, {
        status: targetStatus,
        resolutionRemarks:
          targetStatus === 'claimed'
            ? 'Owner verified identity and successfully claimed belonging.'
            : '',
      });
      triggerToast(res.message || 'Status updated successfully!');
      if (activeItemDetails && activeItemDetails._id === item._id) {
        setActiveItemDetails(res.item);
      }
      fetchItems();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.message || 'Could not update status.');
    }
  };

  // Delete Listing
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this listing? This cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/lost-found/${itemId}`);
      triggerToast('Listing removed successfully.');
      setActiveItemDetails(null);
      fetchItems();
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert(err.message || 'Could not delete listing.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6 pb-16"
    >
      {/* Toast Notification */}
      {actionSuccessToast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-glow-emerald text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>{actionSuccessToast}</span>
          </div>
        </div>
      )}

      {/* 1. Futuristic Cyber Community Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#090d16] text-white p-6 sm:p-8 border border-indigo-900/50 shadow-hud-indigo">
        {/* Animated Cyber Glow Orbs & Grid */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 right-1/3 -mb-16 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"
        />
        <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />
        <div className="shimmer-line absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none" />

        {/* HUD Corner Tech Brackets */}
        <span className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-indigo-500/60 pointer-events-none" />
        <span className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-500/60 pointer-events-none" />
        <span className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-indigo-500/60 pointer-events-none" />
        <span className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-500/60 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[11px] border border-indigo-500/40 shadow-glow-indigo">
                <Compass className="w-3.5 h-3.5 text-cyan-400" /> ⚡ CAMPUS COMMUNITY REGISTRY
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 text-xs font-mono">• ALL CAMPUS MEMBERS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Campus Lost &amp; Found Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Misplaced your laptop charger, student ID, or calculator? Report lost items or help campus peers reunite with their belongings quickly and securely.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={PlusCircle}
              onClick={() => openReportModal('lost')}
              className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold shadow-glow-rose cursor-pointer"
            >
              Report Lost Item
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={PlusCircle}
              onClick={() => openReportModal('found')}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold shadow-glow-emerald cursor-pointer"
            >
              Report Found Item
            </Button>
          </div>
        </div>
      </div>

      {/* 2. KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <StatCard
          title="Total Listings"
          value={isLoading ? '-' : stats.totalItems}
          description="Total community posts"
          icon={Layers}
          variant="indigo"
          isLoading={isLoading}
        />
        <StatCard
          title="Active Lost Items"
          value={isLoading ? '-' : stats.openLostCount}
          description="Awaiting retrieval"
          icon={AlertCircle}
          variant="rose"
          trend={{ value: 'Searching', isNeutral: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="Found Items"
          value={isLoading ? '-' : stats.openFoundCount}
          description="Safe & ready for claim"
          icon={Compass}
          variant="amber"
          trend={{ value: 'In Custody', isNeutral: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="Reunited Belongings"
          value={isLoading ? '-' : stats.claimedCount}
          description="Successfully claimed"
          icon={CheckCircle2}
          variant="emerald"
          trend={{ value: 'Reunited', isPositive: true }}
          isLoading={isLoading}
        />
      </div>

      {/* 3. Search & Segmented Filtering Toolbar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-premium space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, description, building, or contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category & Building Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Campus Locations</option>
              {CAMPUS_BUILDINGS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {[
            { id: 'all', label: `All Items (${items.length})` },
            { id: 'lost', label: `Lost Possessions (${stats.openLostCount})`, dot: 'bg-rose-500' },
            { id: 'found', label: `Found Items (${stats.openFoundCount})`, dot: 'bg-emerald-500' },
            { id: 'claimed', label: `Reunited / Claimed (${stats.claimedCount})`, dot: 'bg-blue-500' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTab(tab.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg font-bold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer',
                selectedTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {tab.dot && <span className={cn('w-1.5 h-1.5 rounded-full', tab.dot)} />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Items Grid Display */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800">
          <Spinner size="lg" />
          <p className="text-xs text-slate-400 animate-pulse font-medium">Scanning campus lost &amp; found catalog...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <EmptyState
            title="No items found"
            description="No items match your active filters or search terms. Try adjusting the category or location, or report a new item."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isLost = item.type === 'lost';
            const isClaimed = item.status === 'claimed';
            const isOwner = user && String(item.reportedBy?._id || item.reportedBy) === String(user._id);
            const isAdmin = user?.role === 'admin';

            return (
              <motion.div
                key={item._id}
                whileHover={{ y: -5, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'rounded-2xl border bg-white dark:bg-[#0c1220] shadow-hud-indigo hover:shadow-hud-cyan transition-all flex flex-col justify-between overflow-hidden group relative',
                  isClaimed
                    ? 'border-slate-200 dark:border-slate-800 opacity-80'
                    : 'border-slate-200/90 dark:border-indigo-950/60'
                )}
              >
                {/* Tech corner accent */}
                <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500/40 pointer-events-none z-10" />

                {/* Image or Category Fallback */}
                <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-900/80 overflow-hidden flex items-center justify-center">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 space-y-1">
                      <ImageIcon className="w-8 h-8 stroke-1 text-slate-400" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">No Photo Uploaded</span>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider shadow-sm',
                        isLost
                          ? 'bg-rose-500 text-white shadow-glow-rose'
                          : 'bg-emerald-600 text-white shadow-glow-emerald'
                      )}
                    >
                      {isLost ? 'LOST ITEM' : 'FOUND ITEM'}
                    </span>

                    {isClaimed && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-600 text-white shadow-glow-cyan flex items-center gap-1">
                        <Check className="w-3 h-3" /> Reunited
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-950/80 text-white backdrop-blur-xs border border-slate-700/60">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="space-y-1 text-xs pt-1">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="font-medium text-[11px] truncate">
                          {item.location?.building}
                          {item.location?.specificSpot ? ` (${item.location.specificSpot})` : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {new Date(item.itemDate || item.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Strip */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="text-[11px]">
                      <span className="text-slate-400 block text-[10px]">Contact:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-[120px] block">
                        {item.contact?.name || 'Campus Member'}
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      rightIcon={ArrowRight}
                      onClick={() => setActiveItemDetails(item)}
                      className="text-xs font-bold py-1.5 cursor-pointer shadow-glow-indigo"
                    >
                      {isLost ? 'Help Find' : 'Claim / Contact'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 5. Report Lost or Found Item Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg ring-2 ring-white/20',
                    reportType === 'lost' ? 'bg-rose-600' : 'bg-emerald-600'
                  )}
                >
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    {reportType === 'lost' ? 'Report a Lost Item' : 'Report a Found Item'}
                  </h2>
                  <p className="text-xs text-slate-300">
                    {reportType === 'lost'
                      ? 'Broadcast details of what you misplaced so campus peers can contact you upon locating it.'
                      : 'Help a student or faculty member recover an item you discovered on campus.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmitReport} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Type Switcher */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Listing Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReportType('lost')}
                    className={cn(
                      'p-2.5 rounded-xl border font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-2',
                      reportType === 'lost'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    I Lost an Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setReportType('found')}
                    className={cn(
                      'p-2.5 rounded-xl border font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-2',
                      reportType === 'found'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    I Found an Item
                  </button>
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Item Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Space Grey MacBook Charger, Titan Watch"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Item Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photo Upload with Instant Preview */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Upload Photo of Item (Optional but Recommended)
                </label>
                {imagePreviewUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-48 bg-slate-100 flex items-center justify-center">
                    <img src={imagePreviewUrl} alt="Preview" className="max-h-48 object-contain" />
                    <button
                      type="button"
                      onClick={removeSelectedImage}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                      title="Remove Photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/40">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                      Click to choose photo or drag &amp; drop
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG, WEBP (No size limit)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Location: Campus Building & Spot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Campus Building / Area *
                  </label>
                  <select
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                  >
                    {CAMPUS_BUILDINGS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Specific Room / Spot
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2nd Floor Quiet Room, Bench near water cooler"
                    value={formData.specificSpot}
                    onChange={(e) => setFormData({ ...formData, specificSpot: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Item Description &amp; Distinctive Marks *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe color, brand, condition, stickers, scratches, or any unique traits..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
                />
              </div>

              {/* Contact Information & Handover Instructions */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
                <span className="font-bold text-indigo-950 dark:text-indigo-300 block text-xs">
                  Whom to Contact &amp; How to Claim
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 text-[11px] mb-0.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 text-[11px] mb-0.5">
                      Phone Number (Call/WA) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 text-[11px] mb-0.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 text-[11px] mb-0.5">
                    {reportType === 'found' ? 'Where is the item currently kept?' : 'Preferred handover instructions'}
                  </label>
                  <input
                    type="text"
                    placeholder={
                      reportType === 'found'
                        ? 'e.g. Deposited at Library Reception Desk, with guard room, or keep with me'
                        : 'e.g. Please call me or leave message on WhatsApp'
                    }
                    value={formData.handoverLocation}
                    onChange={(e) => setFormData({ ...formData, handoverLocation: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsReportModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  className={reportType === 'lost' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'}
                >
                  Publish {reportType === 'lost' ? 'Lost Item Notice' : 'Found Item Record'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Active Item Details & Direct Contact Action Modal */}
      {activeItemDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider',
                    activeItemDetails.type === 'lost'
                      ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200'
                      : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                  )}
                >
                  {activeItemDetails.type === 'lost' ? 'Lost Item Notice' : 'Found Item Record'}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs font-bold text-slate-500">{activeItemDetails.category}</span>
              </div>

              <button
                type="button"
                onClick={() => setActiveItemDetails(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Photo Display */}
              {activeItemDetails.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 max-h-72 flex items-center justify-center">
                  <img
                    src={activeItemDetails.imageUrl}
                    alt={activeItemDetails.title}
                    className="max-h-72 w-full object-contain"
                  />
                </div>
              )}

              {/* Title & Status */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {activeItemDetails.title}
                  </h2>
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-bold',
                      activeItemDetails.status === 'claimed'
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                    )}
                  >
                    {activeItemDetails.status === 'claimed' ? 'Successfully Reunited' : 'Active / Open'}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-xs mt-2 leading-relaxed whitespace-pre-line">
                  {activeItemDetails.description}
                </p>
              </div>

              {/* Location & Date Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Location Found/Lost</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-xs">
                      {activeItemDetails.location?.building}
                    </strong>
                    {activeItemDetails.location?.specificSpot && (
                      <p className="text-slate-500 text-[11px]">{activeItemDetails.location.specificSpot}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Date Recorded</span>
                    <strong className="text-slate-800 dark:text-slate-200 text-xs">
                      {new Date(activeItemDetails.itemDate || activeItemDetails.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Contact Information & Action Buttons */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50/30 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 dark:text-indigo-200 text-xs">
                    Contact Person for Retrieval
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Posted by {activeItemDetails.reportedBy?.name || 'Campus Member'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {activeItemDetails.contact?.name || 'Authorized Custodian'}
                    </span>
                  </div>

                  {activeItemDetails.contact?.handoverLocation && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-300">
                      <strong>Handover / Pickup Instructions:</strong> {activeItemDetails.contact.handoverLocation}
                    </div>
                  )}
                </div>

                {/* Direct Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  {activeItemDetails.contact?.phone && (
                    <a
                      href={`tel:${activeItemDetails.contact.phone}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call ({activeItemDetails.contact.phone})
                    </a>
                  )}

                  {activeItemDetails.contact?.phone && (
                    <a
                      href={`https://wa.me/91${activeItemDetails.contact.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Message
                    </a>
                  )}

                  {activeItemDetails.contact?.email && (
                    <a
                      href={`mailto:${activeItemDetails.contact.email}?subject=Regarding Lost/Found: ${encodeURIComponent(activeItemDetails.title)}`}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-500" /> Send Email
                    </a>
                  )}
                </div>
              </div>

              {/* Owner / Admin Management Strip */}
              {(user && (String(activeItemDetails.reportedBy?._id || activeItemDetails.reportedBy) === String(user._id) || user.role === 'admin')) && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Listing Management</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      You have authorization to update status or delete this post.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeItemDetails.status !== 'claimed' ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={CheckCircle2}
                        onClick={() => handleToggleStatus(activeItemDetails, 'claimed')}
                        className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100 font-bold text-xs"
                      >
                        Mark as Reunited / Claimed
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleToggleStatus(activeItemDetails, 'open')}
                        className="text-xs font-bold"
                      >
                        Reopen Listing
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(activeItemDetails._id)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setActiveItemDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LostAndFoundPage;
