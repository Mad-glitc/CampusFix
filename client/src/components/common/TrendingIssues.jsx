import React, { useState, useEffect } from 'react';
import { Flame, ArrowRight, MapPin, Users, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from './Badge';
import UpvoteButton from './UpvoteButton';
import { Spinner } from './Spinner';
import { cn } from '../../utils/cn';
import api from '../../services/axiosInstance';
import { useAuthStore } from '../../store/authStore';

/**
 * Community Trending & Most Supported Campus Issues Widget
 */
export const TrendingIssues = ({ className }) => {
  const { isAuthenticated } = useAuthStore();
  const [trending, setTrending] = useState([]);
  const [votedIds, setVotedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrending = async () => {
    try {
      const [trendRes, votesRes] = await Promise.all([
        api.get('/complaints/trending'),
        isAuthenticated ? api.get('/complaints/my-votes').catch(() => ({ votedIds: [] })) : Promise.resolve({ votedIds: [] }),
      ]);

      setTrending(trendRes.trending || []);
      setVotedIds(votesRes.votedIds || []);
    } catch (err) {
      console.error('Failed to load trending issues:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, [isAuthenticated]);

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-premium space-y-4 transition-colors',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shadow-2xs">
            <Flame className="w-4 h-4 fill-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Trending Campus Issues
            </h3>
            <p className="text-[11px] text-slate-400">
              Community upvoted problems affecting multiple students
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-900/60 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> Community Power
        </span>
      </div>

      {isLoading ? (
        <div className="py-8 flex justify-center">
          <Spinner size="md" />
        </div>
      ) : trending.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400">
          No upvoted issues yet. Be the first to support an unresolved complaint!
        </div>
      ) : (
        <div className="space-y-3">
          {trending.slice(0, 4).map((ticket) => {
            const hasVoted = votedIds.includes(String(ticket._id));

            return (
              <div
                key={ticket._id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-800/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div className="space-y-1 max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {ticket.trackingId}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {ticket.category?.name || 'General'}
                    </span>
                    <PriorityBadge priority={ticket.priority} size="sm" />
                  </div>

                  <Link
                    to={`/track?id=${ticket.trackingId}`}
                    className="text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 line-clamp-1 block"
                  >
                    {ticket.title}
                  </Link>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {ticket.location?.building} • Room {ticket.location?.room}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <UpvoteButton
                    complaintId={ticket._id}
                    initialCount={ticket.upvoteCount || 0}
                    initialVoted={hasVoted}
                    size="sm"
                    onVoteChange={(newVoted, newCount) => {
                      if (newVoted) setVotedIds((prev) => [...prev, String(ticket._id)]);
                      else setVotedIds((prev) => prev.filter((id) => id !== String(ticket._id)));
                    }}
                  />

                  <Link
                    to={`/track?id=${ticket.trackingId}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="View details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrendingIssues;
