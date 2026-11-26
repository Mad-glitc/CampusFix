import React, { useState, useEffect } from 'react';
import Card from '../../components/common/Card';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Textarea from '../../components/forms/Textarea';
import FileInput from '../../components/forms/FileInput';
import { Spinner } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import {
  PlayCircle,
  CheckCircle,
  Wrench,
  FileText,
  MapPin,
  RefreshCw,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Image as ImageIcon,
  CheckCircle2,
  Calendar,
  Layers,
  Camera,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/axiosInstance';

export const StaffQueuePage = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Modal State for Resolution
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [isResolving, setIsResolving] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/staff/queue', {
        params: { status: selectedFilter === 'all' ? undefined : selectedFilter },
      });
      setTasks(res.tasks || []);
    } catch (err) {
      console.error('Failed to load technician queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [selectedFilter]);

  const handleStartTask = async (task) => {
    try {
      await api.patch(`/staff/complaints/${task._id}/status`, {
        status: 'in_progress',
        notes: 'Technician arrived on-site and commenced repair.',
      });
      fetchQueue();
    } catch (err) {
      alert(err.message || 'Failed to update status to In Progress');
    }
  };

  const handleOpenResolve = (task) => {
    setSelectedTask(task);
    setResolutionRemarks('');
    setProofFile(null);
    setModalError('');
    setIsResolveModalOpen(true);
  };

  // Demo autofill for resolution remarks matching faculty demonstration
  const handleAutoFillRemarks = () => {
    setResolutionRemarks(
      'Replaced damaged HDMI port and loose ribbon cable on ceiling mount. Cleaned internal cooling fan filter and verified 1080p 60fps projection output with zero flickering.'
    );
  };

  const handleConfirmResolve = async (e) => {
    e.preventDefault();
    if (!resolutionRemarks.trim()) {
      setModalError('Please enter resolution remarks describing work executed.');
      return;
    }

    setIsResolving(true);
    setModalError('');

    try {
      const formData = new FormData();
      formData.append('resolutionRemarks', resolutionRemarks.trim());
      if (proofFile) {
        formData.append('images', proofFile);
      }

      await api.post(`/staff/complaints/${selectedTask._id}/resolve`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setIsResolveModalOpen(false);
      fetchQueue();
    } catch (err) {
      setModalError(err.message || 'Failed to resolve task.');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
              Technician Field Console
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {tasks.length} Assigned Maintenance Tasks
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Assigned Work Orders & Dispatch Queue
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Accept assignments, update on-site repair progress, and upload completion photographs.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchQueue}
          leftIcon={RefreshCw}
          isLoading={isLoading}
        >
          Refresh Queue
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] p-3 shadow-card flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: 'all', label: 'All Assignments' },
          { id: 'assigned', label: 'Pending Start' },
          { id: 'in_progress', label: 'In Active Progress' },
          { id: 'resolved', label: 'Completed & Verified' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedFilter === tab.id
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task Queue Cards */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800">
          <Spinner size="lg" />
          <p className="text-xs text-slate-400 animate-pulse">Loading technician queue...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-12">
          <EmptyState
            title="No tasks in this category"
            description="Your work queue is currently clear for the selected status. Enjoy your break!"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 sm:p-6 shadow-card hover:shadow-lg transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {task.trackingId}
                  </span>
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  Category: <strong className="text-slate-700 dark:text-slate-300">{task.category?.name}</strong> • Reported by {task.student?.name || 'Student'}
                </span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{task.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {task.description}
                </p>

                <div className="mt-3.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>
                      <strong>Facility Location:</strong> {task.location?.building}, Room {task.location?.room} ({task.location?.floor})
                    </span>
                  </div>
                  {task.location?.landmark && (
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Landmark: {task.location.landmark}
                    </span>
                  )}
                </div>
              </div>

              {/* Initial photo thumbnail if attached */}
              {task.images && task.images.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Student Photo Proof:
                  </span>
                  <a
                    href={task.images[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-800/40"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> View Photo Evidence
                  </a>
                </div>
              )}

              {/* Resolution Remarks Callout if already resolved */}
              {task.status === 'resolved' && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Verified Resolution Record:</span>
                  </div>
                  <p className="pl-5 text-emerald-700 dark:text-emerald-300">{task.resolutionRemarks}</p>
                  {task.resolvedAt && (
                    <span className="pl-5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block">
                      Resolved on: {new Date(task.resolvedAt).toLocaleString()}
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link to={`/track?id=${task.trackingId}`}>
                  <Button variant="ghost" size="sm" rightIcon={ArrowRight} className="text-xs">
                    Public Audit Timeline
                  </Button>
                </Link>

                {task.status === 'assigned' && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={PlayCircle}
                    onClick={() => handleStartTask(task)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                  >
                    Mark In Progress (Arrived On-Site)
                  </Button>
                )}

                {task.status === 'in_progress' && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={CheckCircle}
                    onClick={() => handleOpenResolve(task)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    Upload Completion Proof & Resolve
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Complete Maintenance Order & Submit Proof"
      >
        <form onSubmit={handleConfirmResolve} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {selectedTask?.trackingId}
              </span>
              <PriorityBadge priority={selectedTask?.priority} />
            </div>
            <p className="font-bold text-slate-900 dark:text-white">{selectedTask?.title}</p>
            <p className="text-slate-500 dark:text-slate-400">
              {selectedTask?.location?.building} • {selectedTask?.location?.room}
            </p>
          </div>

          {modalError && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-800/40">
              {modalError}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Resolution Remarks <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAutoFillRemarks}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Demo Autofill Remarks
              </button>
            </div>
            <textarea
              rows={3}
              placeholder="Describe repair actions executed (e.g. replaced HDMI cable, re-soldered connection, verified display output)..."
              value={resolutionRemarks}
              onChange={(e) => setResolutionRemarks(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Completion Photo Proof (Optional, Recommended for Audit)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProofFile(e.target.files[0] || null)}
              className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950/60 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsResolveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isResolving}
              leftIcon={CheckCircle}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Confirm Task Resolution
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StaffQueuePage;
