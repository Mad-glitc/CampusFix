import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { Spinner } from '../../components/common/Spinner';
import {
  PlusCircle,
  Search,
  Filter,
  ArrowRight,
  RefreshCw,
  Calendar,
  MapPin,
  Building2,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  User,
  ExternalLink,
  Layers,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import api from '../../services/axiosInstance';
import { cn } from '../../utils/cn';

export const MyComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [copiedId, setCopiedId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchComplaints = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get('/complaints', {
        params: {
          status: selectedStatus === 'all' ? undefined : selectedStatus,
          search: searchQuery.trim() || undefined,
          page,
          limit: 10,
        },
      });
      setComplaints(res.complaints || []);
      setTotalPages(res.pages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [selectedStatus, page]);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const submittedCount = complaints.filter((c) => c.status === 'submitted').length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'assigned' || c.status === 'in_progress'
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;
  const resolutionRate = complaints.length > 0 ? Math.round((resolvedCount / complaints.length) * 100) : 100;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
              Personal Issue Archive
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {totalCount} Total Issues Logged
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Campus Maintenance History
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Track repair milestones, view technician before/after photographs, and review formal resolution remarks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchComplaints}
            leftIcon={RefreshCw}
            isLoading={isLoading}
            className="text-xs"
          >
            Refresh
          </Button>
          <Link to="/student/report">
            <Button variant="primary" size="sm" leftIcon={PlusCircle} className="font-bold text-xs shadow-xs">
              Report Issue
            </Button>
          </Link>
        </div>
      </div>

      {/* 5 Premium Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCard
          title="Total Logged"
          value={isLoading ? '-' : complaints.length}
          description="Submitted by you"
          icon={Layers}
          variant="indigo"
          isLoading={isLoading}
        />
        <StatCard
          title="Pending Triage"
          value={isLoading ? '-' : submittedCount}
          description="Queued for technician"
          icon={Clock}
          variant="rose"
          trend={{ value: submittedCount > 0 ? 'Queued' : 'Clear', isNeutral: submittedCount === 0 }}
          isLoading={isLoading}
        />
        <StatCard
          title="In Progress"
          value={isLoading ? '-' : inProgressCount}
          description="Technician on-site"
          icon={AlertTriangle}
          variant="amber"
          trend={{ value: 'Active', isNeutral: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="Resolved"
          value={isLoading ? '-' : resolvedCount}
          description="Fixed with photo proof"
          icon={CheckCircle2}
          variant="emerald"
          trend={{ value: '+100%', isPositive: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="Resolution Rate"
          value={isLoading ? '-' : `${resolutionRate}%`}
          description="Personal SLA turnaround"
          icon={Check}
          variant="blue"
          trend={{ value: 'Optimal', isPositive: true }}
          isLoading={isLoading}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Issues' },
            { id: 'submitted', label: 'Submitted' },
            { id: 'assigned', label: 'Assigned' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => {
                setSelectedStatus(st.id);
                setPage(1);
              }}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer',
                selectedStatus === st.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            fetchComplaints();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by title, ID, room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="text-xs font-semibold">
            Search
          </Button>
        </form>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-premium overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <Spinner size="lg" />
            <p className="text-xs text-slate-400 animate-pulse">Loading your complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No complaints in this view"
              description="You have not reported any issues matching the selected status. Click 'Report Issue' above to submit a new problem."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                <tr>
                  <th className="px-5 py-4">Tracking ID</th>
                  <th className="px-5 py-4">Issue Details</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Reported On</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {complaints.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      <div className="flex items-center gap-1.5">
                        <Link to={`/track?id=${item.trackingId}`} className="hover:underline">
                          {item.trackingId}
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleCopyId(item.trackingId)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
                          title="Copy ID"
                        >
                          {copiedId === item.trackingId ? (
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {item.description}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">
                      {item.category?.name || 'General'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-900 dark:text-slate-100 font-semibold">{item.location?.building}</div>
                      <div className="text-[11px] text-slate-400">
                        Room {item.location?.room} {item.location?.floor && `(${item.location.floor})`}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                      {item.feedback?.rating ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 mt-1">
                          <span>⭐ {item.feedback.rating}/5</span>
                          <span className="text-slate-400 font-normal">
                            ({item.feedback.isSatisfied === 'satisfied' ? 'Satisfied' : 'Reviewed'})
                          </span>
                        </div>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'resolved' && !item.feedback?.rating && (
                          <Link to={`/track?id=${item.trackingId}`}>
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 hover:bg-amber-100 transition-colors inline-flex items-center gap-1">
                              ⭐ Give Feedback
                            </span>
                          </Link>
                        )}
                        <Link to={`/track?id=${item.trackingId}`}>
                          <Button variant="ghost" size="sm" rightIcon={ArrowRight} className="text-xs py-1">
                            Track
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                leftIcon={ChevronLeft}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                rightIcon={ChevronRight}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyComplaintsPage;
