import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Edit3, CheckCircle2, Sparkles, Send, AlertTriangle, HelpCircle } from 'lucide-react';
import Button from './Button';
import { cn } from '../../utils/cn';
import api from '../../services/axiosInstance';

/**
 * Student Satisfaction & Desired Changes Feedback Component
 * STRICTLY FOR STUDENTS to evaluate issue resolution and request changes
 */
export const StudentFeedbackCard = ({ complaint, currentUser, onFeedbackUpdated }) => {
  const isStudent = currentUser?.role === 'student';
  const existingFeedback = complaint?.feedback?.submittedAt ? complaint.feedback : null;

  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(existingFeedback?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSatisfied, setIsSatisfied] = useState(existingFeedback?.isSatisfied || 'satisfied');
  const [desiredChanges, setDesiredChanges] = useState(existingFeedback?.desiredChanges || '');
  const [comments, setComments] = useState(existingFeedback?.comments || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isStudent) return;

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await api.post(`/complaints/${complaint._id}/feedback`, {
        rating,
        isSatisfied,
        desiredChanges,
        comments,
      });

      setSuccessMessage('Thank you! Your feedback has been recorded.');
      setIsEditing(false);
      if (onFeedbackUpdated) {
        onFeedbackUpdated(res.feedback, res.complaint);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSatisfiedBadge = (status) => {
    switch (status) {
      case 'satisfied':
        return {
          label: 'Fully Satisfied 😊',
          className: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40',
        };
      case 'partially_satisfied':
        return {
          label: 'Partially Satisfied 😐',
          className: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
        };
      case 'unsatisfied':
      default:
        return {
          label: 'Not Satisfied 🙁',
          className: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/40',
        };
    }
  };

  // Case 1: Student is viewing and already submitted feedback (and not in edit mode)
  if (existingFeedback && !isEditing) {
    const badge = getSatisfiedBadge(existingFeedback.isSatisfied);

    return (
      <div className="rounded-3xl border border-indigo-200/80 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-slate-900 dark:via-[#111827] dark:to-indigo-950/30 p-6 shadow-premium space-y-4 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Student Resolution Review
              </h3>
              <p className="text-[11px] text-slate-400">
                Submitted on {new Date(existingFeedback.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn('text-xs font-bold px-3 py-1 rounded-full border', badge.className)}>
              {badge.label}
            </span>
            {isStudent && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                leftIcon={Edit3}
                className="text-xs py-1"
              >
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-1.5 pt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                'w-5 h-5',
                star <= (existingFeedback.rating || 5)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-200 dark:text-slate-700'
              )}
            />
          ))}
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1.5">
            {existingFeedback.rating} / 5 Rating
          </span>
        </div>

        {/* Desired Changes & Improvements */}
        {existingFeedback.desiredChanges ? (
          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Requested Changes & Further Adjustments:
            </span>
            <p className="text-xs text-amber-950 dark:text-amber-200 font-medium">
              &quot;{existingFeedback.desiredChanges}&quot;
            </p>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 dark:text-slate-500 italic">
            No further changes requested. Work accepted as complete.
          </div>
        )}

        {/* Comments */}
        {existingFeedback.comments && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px] mb-0.5">Student Remarks:</span>
            &quot;{existingFeedback.comments}&quot;
          </div>
        )}
      </div>
    );
  }

  // Case 2: User is NOT a student and no feedback has been submitted
  if (!isStudent && !existingFeedback) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-5 text-center bg-slate-50/50 dark:bg-slate-900/30 space-y-1.5">
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <HelpCircle className="w-4 h-4" />
        </div>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Awaiting Student Satisfaction Feedback
        </p>
        <p className="text-[11px] text-slate-400">
          The reporting student will evaluate the repair work and specify any additional changes required.
        </p>
      </div>
    );
  }

  // Case 3: User IS a student (submitting new or editing feedback)
  return (
    <div className="rounded-3xl border border-indigo-200/90 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 dark:from-slate-900 dark:via-[#111827] dark:to-indigo-950/30 p-6 shadow-premium space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center justify-between border-b border-indigo-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Student Resolution Feedback
            </h3>
            <p className="text-[11px] text-slate-400">
              Tell campus maintenance how satisfied you are and what changes you want.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50">
          Students Only
        </span>
      </div>

      {successMessage && (
        <div className="p-3 text-xs rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800/40 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            1. Overall Satisfaction Rating
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-300 dark:text-slate-700 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={cn(
                        'w-6 h-6 transition-colors',
                        isActive ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'
                      )}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-2">
              {rating === 5 ? 'Excellent ⭐ 5/5' : rating === 4 ? 'Good ⭐ 4/5' : rating === 3 ? 'Average ⭐ 3/5' : rating === 2 ? 'Poor ⭐ 2/5' : 'Very Poor ⭐ 1/5'}
            </span>
          </div>
        </div>

        {/* Satisfaction Status Radios */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            2. Are you satisfied with the technician&apos;s resolution?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              {
                value: 'satisfied',
                label: 'Fully Satisfied 😊',
                desc: 'Issue resolved properly',
                activeClass: 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/20',
              },
              {
                value: 'partially_satisfied',
                label: 'Partially Satisfied 😐',
                desc: 'Works but needs tweaks',
                activeClass: 'border-amber-600 dark:border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20',
              },
              {
                value: 'unsatisfied',
                label: 'Not Satisfied 🙁',
                desc: 'Problem still persists',
                activeClass: 'border-rose-600 dark:border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-950 dark:text-rose-200 ring-2 ring-rose-500/20',
              },
            ].map((opt) => {
              const selected = isSatisfied === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setIsSatisfied(opt.value)}
                  className={cn(
                    'p-3 rounded-2xl border text-left transition-all cursor-pointer',
                    selected
                      ? opt.activeClass
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  )}
                >
                  <span className="text-xs font-bold block">{opt.label}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desired Changes & Improvements Text Input */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            3. What changes or further improvements do you want?
          </label>
          <input
            type="text"
            placeholder="e.g. Please secure the loose cable clips, adjust projector tilt, or clean up debris..."
            value={desiredChanges}
            onChange={(e) => setDesiredChanges(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 font-medium placeholder:text-slate-400"
          />
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Specify any adjustments you want the facility department or technician to follow up on.
          </p>
        </div>

        {/* Overall Comments */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            4. Additional Comments & Service Feedback (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="Feedback on technician punctuality, courtesy, or campus infrastructure..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 font-medium placeholder:text-slate-400 leading-relaxed"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {existingFeedback && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            leftIcon={Send}
            className="font-bold text-xs shadow-xs"
          >
            {existingFeedback ? 'Update Feedback' : 'Submit Student Feedback'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StudentFeedbackCard;
