import React, { useState, useEffect, useMemo } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Check,
  RotateCcw,
} from 'lucide-react';
import AnnouncementCard from '../../components/common/AnnouncementCard';
import AnnouncementEditor from '../../components/common/AnnouncementEditor';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { cn } from '../../utils/cn';
import api from '../../services/axiosInstance';
import { useAuthStore } from '../../store/authStore';

const CATEGORIES = [
  'all',
  'Emergency Notice',
  'Electricity Maintenance',
  'Water Supply Disruption',
  'Wi-Fi Outage',
  'Building Maintenance',
  'Cleaning Schedule',
  'General Announcement',
];

export const AnnouncementCenterPage = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'resolved'
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Resolve Modal State
  const [resolveItem, setResolveItem] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.get('/announcements', { params });
      setAnnouncements(res.announcements || []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedCategory]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAnnouncements();
  };

  const handleMarkAsRead = async (announcementId) => {
    try {
      await api.post(`/announcements/${announcementId}/read`);
      setAnnouncements((prev) =>
        prev.map((a) => (a._id === announcementId ? { ...a, isRead: true } : a))
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // Open resolve dialog
  const handleOpenResolve = (announcement) => {
    setResolveItem(announcement);
    setResolutionNote(
      `The maintenance issue regarding ${announcement.title} has been successfully resolved and normal facility operations have been safely restored.`
    );
  };

  // Confirm resolve
  const handleConfirmResolve = async () => {
    if (!resolveItem) return;
    setIsResolving(true);
    try {
      const res = await api.patch(`/announcements/${resolveItem._id}/resolve`, {
        resolutionNote: resolutionNote.trim(),
      });

      // Update state locally
      setAnnouncements((prev) =>
        prev.map((a) => (a._id === resolveItem._id ? res.announcement : a))
      );

      triggerToast(
        `"${resolveItem.title}" marked as resolved! Broadcast notifications dispatched to all students and staff.`
      );
      setResolveItem(null);
    } catch (err) {
      console.error('Failed to resolve announcement:', err);
      alert(err.message || 'Could not mark announcement as resolved.');
    } finally {
      setIsResolving(false);
    }
  };

  // Reopen notice
  const handleReopen = async (announcementId) => {
    try {
      const res = await api.patch(`/announcements/${announcementId}/reopen`);
      setAnnouncements((prev) =>
        prev.map((a) => (a._id === announcementId ? res.announcement : a))
      );
      triggerToast('Notice has been reopened as active.');
    } catch (err) {
      console.error('Failed to reopen notice:', err);
    }
  };

  // Filtered views
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const isResolved = a.isResolved || a.status === 'resolved';
      if (statusFilter === 'active' && isResolved) return false;
      if (statusFilter === 'resolved' && !isResolved) return false;
      return true;
    });
  }, [announcements, statusFilter]);

  const emergencyAnnouncements = filteredAnnouncements.filter(
    (a) => !a.isResolved && (a.isEmergency || a.priority === 'emergency')
  );
  const resolvedAnnouncements = filteredAnnouncements.filter(
    (a) => a.isResolved || a.status === 'resolved'
  );
  const standardAnnouncements = filteredAnnouncements.filter(
    (a) => !a.isResolved && !a.isEmergency && a.priority !== 'emergency'
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs font-semibold max-w-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
              Campus Communications
            </span>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Verified Operational Registry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Campus Announcement Center
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time advisories, maintenance updates, emergency alerts, and verified problem resolution notifications.
          </p>
        </div>

        {isAdmin && (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setIsEditorOpen(true)}
            leftIcon={Plus}
            className="font-bold shadow-xs shrink-0 bg-indigo-600 hover:bg-indigo-700"
          >
            Broadcast Announcement
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 shadow-premium space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: `All Notices (${announcements.length})` },
              {
                id: 'active',
                label: `Active Issues (${announcements.filter((a) => !a.isResolved).length})`,
              },
              {
                id: 'resolved',
                label: `Resolved (${announcements.filter((a) => a.isResolved).length})`,
                dot: 'bg-emerald-500',
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-1.5',
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                {tab.dot && <span className={cn('w-1.5 h-1.5 rounded-full', tab.dot)} />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search advisories or resolved notices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-indigo-500 font-medium w-full sm:w-64"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm" className="text-xs">
              Search
            </Button>
          </form>
        </div>

        {/* Category Chips */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'text-xs px-3 py-1 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer border',
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              )}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Spinner size="lg" />
          <p className="text-xs text-slate-400 font-medium">Loading campus announcements...</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <EmptyState
          title="No announcements matching criteria"
          description="There are currently no notices matching the selected category or status filter."
        />
      ) : (
        <div className="space-y-6">
          {/* 1. Emergency notices section */}
          {emergencyAnnouncements.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
                Active Campus Alerts & Emergency Outages ({emergencyAnnouncements.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {emergencyAnnouncements.map((ann) => (
                  <AnnouncementCard
                    key={ann._id}
                    announcement={ann}
                    onMarkAsRead={handleMarkAsRead}
                    onResolve={handleOpenResolve}
                    onReopen={handleReopen}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 2. Resolved Problems Section (Prominently displays resolved repairs!) */}
          {resolvedAnnouncements.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Resolved Facility Problems & Restored Operations ({resolvedAnnouncements.length})
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">Normal capacity restored</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resolvedAnnouncements.map((ann) => (
                  <AnnouncementCard
                    key={ann._id}
                    announcement={ann}
                    onMarkAsRead={handleMarkAsRead}
                    onResolve={handleOpenResolve}
                    onReopen={handleReopen}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 3. General facility notices grid */}
          {standardAnnouncements.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                General Facility Advisories & Maintenance Schedules ({standardAnnouncements.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {standardAnnouncements.map((ann) => (
                  <AnnouncementCard
                    key={ann._id}
                    announcement={ann}
                    onMarkAsRead={handleMarkAsRead}
                    onResolve={handleOpenResolve}
                    onReopen={handleReopen}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Broadcast Creator Modal */}
      {isAdmin && (
        <AnnouncementEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onCreated={(newAnn) => {
            setAnnouncements((prev) => [newAnn, ...prev]);
            triggerToast('Announcement broadcasted to campus network.');
          }}
        />
      )}

      {/* Admin Resolve Confirmation Modal */}
      {resolveItem && (
        <Modal
          isOpen={true}
          onClose={() => setResolveItem(null)}
          title="Mark Problem as Resolved"
          description="Confirm that maintenance work has concluded and facility operations have been safely restored. A broadcast notification will be sent to all campus users."
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-slate-800 bg-indigo-50/50 dark:bg-slate-900/50 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                Target Notice:
              </span>
              <p className="text-xs font-black text-slate-900 dark:text-white">{resolveItem.title}</p>
              <p className="text-[11px] text-slate-500 line-clamp-1">{resolveItem.content}</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Resolution Remarks & Operational Confirmation:
              </label>
              <textarea
                rows={3}
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="Describe how the problem was resolved (e.g., Main pipeline pressure restored, water tested safe to drink)..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
              />
              <span className="text-[10px] text-slate-400 block">
                This message will be shown on the student dashboard banner and sent as a direct notification to all students and staff.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setResolveItem(null)}
                disabled={isResolving}
                className="text-xs"
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmResolve}
                isLoading={isResolving}
                leftIcon={CheckCircle2}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Confirm Resolution & Broadcast
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AnnouncementCenterPage;
