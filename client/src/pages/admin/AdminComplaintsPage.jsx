import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/common/Card';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Select from '../../components/forms/Select';
import { Spinner } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import {
  UserCheck,
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/axiosInstance';
import { cn } from '../../utils/cn';
import { SLACountdown } from '../../components/common/SLACountdown';

export const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);

  // Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('all');
  const [selectedSlaFilter, setSelectedSlaFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.categories) setCategories(res.categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get('/admin/staff');
      if (res.staff) setStaffList(res.staff);
    } catch (err) {
      console.error('Failed to load staff list:', err);
    }
  };

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/complaints', {
        params: {
          status: selectedStatus === 'all' ? undefined : selectedStatus,
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          priority: selectedPriorityFilter === 'all' ? undefined : selectedPriorityFilter,
          search: searchQuery.trim() || undefined,
          page,
          limit: 10,
        },
      });
      setComplaints(res.complaints || []);
      setTotalPages(res.pages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchStaff();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [selectedStatus, selectedCategory, selectedPriorityFilter, page]);

  // Client-side filtering & sorting
  const sortedComplaints = useMemo(() => {
    let list = [...complaints];

    if (selectedSlaFilter === 'overdue') {
      list = list.filter((c) => c.isOverdue || (c.slaDeadline && new Date(c.slaDeadline) < new Date() && c.status !== 'resolved'));
    } else if (selectedSlaFilter === 'escalated') {
      list = list.filter((c) => (c.escalationLevel || 0) > 0);
    }

    if (sortBy === 'newest') {
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (sortBy === 'oldest') {
      return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    if (sortBy === 'priority') {
      const weight = { urgent: 4, high: 3, medium: 2, low: 1 };
      return list.sort((a, b) => (weight[b.priority] || 0) - (weight[a.priority] || 0));
    }
    if (sortBy === 'upvotes') {
      return list.sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0));
    }
    return list;
  }, [complaints, sortBy, selectedSlaFilter]);

  const handleOpenAssign = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignedStaffId(complaint.assignedStaff?._id || (staffList[0]?._id || ''));
    setSelectedPriority(complaint.priority || 'medium');
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedComplaint?._id || !assignedStaffId) {
      alert('Please select a technician to dispatch.');
      return;
    }

    setIsAssigning(true);
    try {
      await api.post('/admin/assign', {
        complaintId: selectedComplaint._id,
        staffId: assignedStaffId,
        priority: selectedPriority,
      });

      setIsAssignModalOpen(false);
      fetchComplaints();
      fetchStaff();
    } catch (err) {
      alert(err.message || 'Failed to assign staff.');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
              Campus Operations
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {totalCount} Total Registered Tickets
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Issue Management & Triage Console
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Review incoming complaints, adjust SLAs, and dispatch technicians across campus blocks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchComplaints}
            leftIcon={RefreshCw}
            isLoading={isLoading}
            className="text-xs"
          >
            Refresh Grid
          </Button>
        </div>
      </div>

      {/* Comprehensive Filter Bar (Linear/Stripe Inspired) */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 shadow-premium space-y-3">
        {/* Top Row: Status Pills & Global Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Issues' },
              { id: 'submitted', label: 'Pending Triage' },
              { id: 'assigned', label: 'Dispatched' },
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

          {/* Search box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              fetchComplaints();
            }}
            className="flex items-center gap-2 w-full md:w-auto"
          >
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket ID, student, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm" className="text-xs font-semibold">
              Filter
            </Button>
          </form>
        </div>

        {/* Bottom Row: Category, Priority, and Sort Dropdowns */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriorityFilter}
              onChange={(e) => {
                setSelectedPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* SLA Escalation Filter */}
            <select
              value={selectedSlaFilter}
              onChange={(e) => setSelectedSlaFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All SLA Timelines</option>
              <option value="overdue">🚨 Overdue / SLA Breached</option>
              <option value="escalated">⚡ Escalated Incidents</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Highest Priority</option>
              <option value="upvotes">🔥 Most Supported / Upvotes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-premium overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-3">
            <Spinner size="lg" />
            <p className="text-xs text-slate-400 animate-pulse">Loading campus complaints registry...</p>
          </div>
        ) : sortedComplaints.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title="No complaints matching criteria"
              description="No tickets match the selected status, category, or search query. Reset filters to see all issues."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                <tr>
                  <th className="px-5 py-4">Complaint ID</th>
                  <th className="px-5 py-4">Issue Title</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Reported By</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Status & SLA</th>
                  <th className="px-5 py-4">Reported Date</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {sortedComplaints.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      <div className="flex items-center gap-1.5">
                        <Link to={`/track?id=${item.trackingId}`} className="hover:underline">
                          {item.trackingId}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.title}</span>
                        {(item.upvoteCount || 0) > 0 && (
                          <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                            ▲ {item.upvoteCount}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {item.description}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                        {item.category?.name || 'General'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-900 dark:text-slate-100 font-semibold">{item.location?.building}</div>
                      <div className="text-[11px] text-slate-400">
                        Room {item.location?.room} {item.location?.floor && `(${item.location.floor})`}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {item.student?.name ? item.student.name.slice(0, 2).toUpperCase() : 'ST'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.student?.name || 'Student'}</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">{item.student?.department || 'Main Campus'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <StatusBadge status={item.status} />
                        {item.slaDeadline && item.status !== 'resolved' && (
                          <div className="pt-0.5">
                            <SLACountdown
                              deadline={item.slaDeadline}
                              status={item.status}
                              isPaused={item.slaPaused}
                            />
                          </div>
                        )}
                        {(item.escalationLevel || 0) > 0 && (
                          <span className="inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800">
                            L{item.escalationLevel} Escalated
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 text-right space-x-1.5 whitespace-nowrap">
                      <Button
                        variant={item.assignedStaff ? 'outline' : 'primary'}
                        size="sm"
                        leftIcon={UserCheck}
                        onClick={() => handleOpenAssign(item)}
                        className="text-xs py-1"
                      >
                        {item.assignedStaff ? 'Reassign' : 'Dispatch'}
                      </Button>
                      <Link to={`/track?id=${item.trackingId}`}>
                        <Button variant="ghost" size="sm" rightIcon={ArrowRight} className="text-xs py-1">
                          Audit
                        </Button>
                      </Link>
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
              Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} items)
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

      {/* Dispatch Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Dispatch Maintenance Staff"
      >
        {selectedComplaint && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedComplaint.trackingId}
                </span>
                <PriorityBadge priority={selectedComplaint.priority} />
                <StatusBadge status={selectedComplaint.status} />
              </div>
              <p className="font-bold text-slate-900 dark:text-white">{selectedComplaint.title}</p>
              <p className="text-slate-500 dark:text-slate-400">
                {selectedComplaint.location?.building} • Room {selectedComplaint.location?.room}
              </p>
            </div>

            <Select
              label="Select Maintenance Technician"
              value={assignedStaffId}
              onChange={(e) => setAssignedStaffId(e.target.value)}
              options={staffList.map((st) => ({
                value: st._id,
                label: `${st.name} — ${st.department} (${st.email})`,
              }))}
            />

            <Select
              label="Enforce SLA Priority"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              options={[
                { value: 'low', label: 'Low — 48 Hour Target SLA' },
                { value: 'medium', label: 'Medium — 24 Hour Target SLA' },
                { value: 'high', label: 'High — 8 Hour Urgent SLA' },
                { value: 'urgent', label: 'Urgent — 2 Hour Emergency SLA' },
              ]}
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmAssign}
                isLoading={isAssigning}
                leftIcon={UserCheck}
              >
                Confirm Dispatch
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminComplaintsPage;
