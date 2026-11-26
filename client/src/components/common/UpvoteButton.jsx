import React, { useState } from 'react';
import { ThumbsUp, Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import api from '../../services/axiosInstance';
import { useAuthStore } from '../../store/authStore';

/**
 * Community Upvoting Interactive Button
 * Prevents duplicate voting and syncs with backend atomically
 */
export const UpvoteButton = ({
  complaintId,
  initialCount = 0,
  initialVoted = false,
  size = 'md',
  className,
  onVoteChange,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const [upvoteCount, setUpvoteCount] = useState(initialCount);
  const [isVoted, setIsVoted] = useState(initialVoted);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const handleToggleVote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please sign in to upvote campus facility requests.');
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      if (isVoted) {
        // Remove vote
        const res = await api.delete(`/complaints/${complaintId}/vote`);
        setIsVoted(false);
        setUpvoteCount(res.upvoteCount);
        if (onVoteChange) onVoteChange(false, res.upvoteCount);
      } else {
        // Add vote
        const res = await api.post(`/complaints/${complaintId}/vote`);
        setIsVoted(true);
        setUpvoteCount(res.upvoteCount);
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 600);
        if (onVoteChange) onVoteChange(true, res.upvoteCount);
      }
    } catch (err) {
      console.error('Vote failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={handleToggleVote}
      disabled={isLoading}
      title={isVoted ? 'Remove your upvote' : 'Support this campus issue'}
      className={cn(
        'group relative inline-flex items-center gap-1.5 rounded-xl border transition-all duration-200 cursor-pointer select-none font-semibold shadow-2xs',
        isSmall ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs',
        isVoted
          ? 'bg-indigo-600 text-white border-indigo-600 dark:bg-indigo-600 dark:border-indigo-500 shadow-indigo-500/20 shadow-xs'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20',
        isLoading && 'opacity-60 cursor-wait',
        showAnimation && 'scale-105',
        className
      )}
    >
      <ThumbsUp
        className={cn(
          isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4',
          'transition-transform duration-200',
          isVoted ? 'fill-white stroke-white' : 'group-hover:-translate-y-0.5'
        )}
      />
      <span className="font-mono font-bold">{upvoteCount}</span>
      <span className={cn('hidden sm:inline font-sans font-medium', isVoted ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500')}>
        {isVoted ? 'Supported' : 'Support'}
      </span>
    </button>
  );
};

export default UpvoteButton;
