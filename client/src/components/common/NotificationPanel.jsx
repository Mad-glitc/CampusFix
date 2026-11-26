import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Clock,
  ExternalLink,
  X,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Megaphone,
  Flame,
  Wrench,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/axiosInstance';
import { useAuthStore } from '../../store/authStore';

/**
 * Live User Notification Panel with Light & Dark Mode support
 */
export const NotificationPanel = ({ isOpen, onClose, onUnreadCountChange }) => {
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
        if (onUnreadCountChange) onUnreadCountChange(res.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, isAuthenticated]);

  const markSingleRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (onUnreadCountChange) onUnreadCountChange(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      if (onUnreadCountChange) onUnreadCountChange(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  if (!isOpen) return null;

  const renderIcon = (type, title = '') => {
    if (title && (title.includes('RESOLVED') || title.includes('✅'))) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
    switch (type) {
      case 'escalation':
        return <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-purple-500" />;
      case 'upvote':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'assignment':
        return <Wrench className="w-4 h-4 text-indigo-500" />;
      case 'status_update':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <Clock className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown Card */}
      <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-elevated overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Campus Notifications
            </h4>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                Mark read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-84 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 animate-pulse">
              Syncing notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto opacity-70" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">You're all caught up!</p>
              <p className="text-[11px] text-slate-400">No pending SLA escalations or alerts.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                onClick={() => !item.isRead && markSingleRead(item._id)}
                className={`p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                  !item.isRead ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">{renderIcon(item.type, item.title)}</div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {item.message}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block pt-0.5">
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0 mt-1" />
                  )}
                </div>

                {item.relatedComplaint?.trackingId && (
                  <div className="mt-2 pl-6">
                    <Link
                      to={`/track?id=${item.relatedComplaint.trackingId}`}
                      onClick={onClose}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                    >
                      Track Ticket ({item.relatedComplaint.trackingId}) <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center">
          <Link
            to="/announcements"
            onClick={onClose}
            className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Visit Announcement Center →
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
