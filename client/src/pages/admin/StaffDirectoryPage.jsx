import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Users,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Wrench,
  RefreshCw,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Star,
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Layers,
  Activity,
  Check,
  Building2,
  Briefcase,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/axiosInstance';
import { cn } from '../../utils/cn';
import TechnicianFeedbackModal from '../../components/admin/TechnicianFeedbackModal';

/**
 * Premium Technician Personnel & Attendance Operations Dashboard
 */
export const StaffDirectoryPage = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingPresenceId, setIsUpdatingPresenceId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedStaffForFeedback, setSelectedStaffForFeedback] = useState(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'present', 'available', 'busy', 'off_duty'
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/staff');
      setStaffMembers(res.staff || []);
      setSummary(res.summary || null);
    } catch (err) {
      console.error('Failed to load technician staff roster:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Show temporary toast message
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Toggle Presence / Attendance status
  const handleTogglePresence = async (staffId, currentPresence) => {
    setIsUpdatingPresenceId(staffId);
    try {
      const res = await api.patch(`/admin/staff/${staffId}/presence`, {
        isPresent: !currentPresence,
      });

      // Optimistically update local state
      setStaffMembers((prev) =>
        prev.map((s) => {
          if (s._id === staffId) {
            const nextPresent = !currentPresence;
            const nextStatus = !nextPresent ? 'off_duty' : (s.activeTasks > 2 ? 'busy' : 'available');
            return {
              ...s,
              isPresent: nextPresent,
              status: nextStatus,
            };
          }
          return s;
        })
      );

      triggerToast(res.message || 'Technician attendance updated successfully.');
    } catch (err) {
      console.error('Failed to update attendance:', err);
      alert(err.message || 'Could not update attendance status.');
    } finally {
      setIsUpdatingPresenceId(null);
    }
  };

  // Compute live stats if summary is not yet loaded
  const computedSummary = useMemo(() => {
    const total = staffMembers.length;
    const present = staffMembers.filter((s) => s.isPresent).length;
    const available = staffMembers.filter((s) => s.isPresent && s.status === 'available').length;
    const busy = staffMembers.filter((s) => s.isPresent && (s.status === 'busy' || s.activeTasks > 0)).length;
    const offDuty = staffMembers.filter((s) => !s.isPresent || s.status === 'off_duty').length;
    return {
      total,
      present,
      available,
      busy,
      offDuty,
      attendanceRate: total > 0 ? Math.round((present / total) * 100) : 100,
    };
  }, [staffMembers]);

  // Unique departments for filter dropdown
  const departments = useMemo(() => {
    const depts = new Set(staffMembers.map((s) => s.department).filter(Boolean));
    return Array.from(depts);
  }, [staffMembers]);

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffMembers.filter((staff) => {
      // 1. Text search
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === '' ||
        staff.name?.toLowerCase().includes(query) ||
        staff.department?.toLowerCase().includes(query) ||
        staff.specialty?.toLowerCase().includes(query) ||
        staff.email?.toLowerCase().includes(query) ||
        staff.phoneNumber?.includes(query);

      if (!matchesSearch) return false;

      // 2. Department filter
      if (departmentFilter !== 'all' && staff.department !== departmentFilter) {
        return false;
      }

      // 3. Status filter
      if (statusFilter === 'present') {
        return staff.isPresent === true;
      }
      if (statusFilter === 'available') {
        return staff.isPresent === true && staff.status === 'available';
      }
      if (statusFilter === 'busy') {
        return staff.isPresent === true && (staff.status === 'busy' || staff.activeTasks > 0);
      }
      if (statusFilter === 'off_duty') {
        return !staff.isPresent || staff.status === 'off_duty';
      }

      return true;
    });
  }, [staffMembers, searchQuery, statusFilter, departmentFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
              Personnel Operations
            </span>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {computedSummary.present} of {computedSummary.total} Technicians On-Duty
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Technician Staff Roster
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Real-time technician presence tracking, trade specialties, active dispatch queues, and individual turnaround performance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStaff}
            leftIcon={RefreshCw}
            isLoading={isLoading}
            className="text-xs"
          >
            Refresh Roster
          </Button>

          <Link to="/admin/complaints">
            <Button
              variant="primary"
              size="sm"
              rightIcon={ArrowUpRight}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
            >
              Assign Tickets
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Five Operational KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCard
          title="Total Technicians"
          value={isLoading ? '-' : computedSummary.total}
          description="Certified Campus Staff"
          icon={Users}
          variant="indigo"
          isLoading={isLoading}
        />
        <StatCard
          title="Present On-Duty"
          value={isLoading ? '-' : computedSummary.present}
          description={`${computedSummary.attendanceRate}% Attendance Today`}
          icon={UserCheck}
          variant="emerald"
          isLoading={isLoading}
        />
        <StatCard
          title="Available for Dispatch"
          value={isLoading ? '-' : computedSummary.available}
          description="Ready for Immediate Assignment"
          icon={CheckCircle2}
          variant="blue"
          isLoading={isLoading}
        />
        <StatCard
          title="On Active Tasks"
          value={isLoading ? '-' : computedSummary.busy}
          description="Technicians On-Site"
          icon={Wrench}
          variant="amber"
          isLoading={isLoading}
        />
        <StatCard
          title="Off-Duty / Leave"
          value={isLoading ? '-' : computedSummary.offDuty}
          description="Unavailable for Triage"
          icon={UserX}
          variant="rose"
          isLoading={isLoading}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* 3. Search, Filter & View Mode Controls Bar */}
      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-premium space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, trade specialty, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Department Filter & Layout Toggle */}
          <div className="flex items-center gap-2.5">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Departments ({departments.length})</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                )}
                title="Grid Cards View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={cn(
                  'p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                )}
                title="Table Operations View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>

          {[
            { id: 'all', label: `All Staff (${computedSummary.total})` },
            { id: 'present', label: `Present • On-Duty (${computedSummary.present})`, dot: 'bg-emerald-500' },
            { id: 'available', label: `Available for Dispatch (${computedSummary.available})` },
            { id: 'busy', label: `On Active Dispatch (${computedSummary.busy})` },
            { id: 'off_duty', label: `Off-Duty (${computedSummary.offDuty})` },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setStatusFilter(pill.id)}
              className={cn(
                'px-3 py-1 rounded-lg font-bold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer',
                statusFilter === pill.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {pill.dot && <span className={cn('w-1.5 h-1.5 rounded-full', pill.dot)} />}
              <span>{pill.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Staff Content (Grid Cards or Tabular Operations) */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800">
          <Spinner size="lg" />
          <p className="text-xs text-slate-400 animate-pulse font-medium">Loading technician personnel roster...</p>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-12">
          <EmptyState
            title="No technicians match criteria"
            description="No staff members found matching the selected status or department filter. Reset filters to see all technicians."
          />
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => {
            const isPresent = staff.isPresent !== false;
            return (
              <div
                key={staff._id}
                className={cn(
                  'p-5 rounded-2xl border bg-white dark:bg-[#111827] shadow-premium hover:shadow-premium-hover transition-all flex flex-col justify-between space-y-4',
                  isPresent
                    ? 'border-slate-200/90 dark:border-slate-800'
                    : 'border-slate-200 dark:border-slate-800/60 opacity-85'
                )}
              >
                {/* Card Top: Avatar, Name & Live Presence Indicator */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                          {staff.name ? staff.name.slice(0, 2).toUpperCase() : 'TC'}
                        </div>
                        {/* Attendance Dot */}
                        <span
                          className={cn(
                            'absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-[#111827]',
                            isPresent ? 'bg-emerald-500' : 'bg-slate-400'
                          )}
                          title={isPresent ? 'Present (On-Duty)' : 'Off-Duty'}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            {staff.name}
                          </h3>
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        </div>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                          {staff.department}
                        </p>
                      </div>
                    </div>

                    {/* Attendance / Presence Badge */}
                    <div className="text-right shrink-0">
                      {isPresent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Present</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>Off-Duty</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Specialty & Shift Info */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-[11px]">{staff.specialty || 'General Maintenance'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11px]">{staff.shift || 'Morning Shift (08:00 - 16:30)'}</span>
                    </div>
                  </div>

                  {/* Workload & Tasks Metric Strip */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-center">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Active
                      </span>
                      <span
                        className={cn(
                          'text-xs font-black',
                          staff.activeTasks > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'
                        )}
                      >
                        {staff.activeTasks || 0} tasks
                      </span>
                    </div>
                    <div className="border-x border-slate-200 dark:border-slate-800">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Resolved
                      </span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {staff.completedTasks || 0} fixes
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStaffForFeedback(staff)}
                      className="cursor-pointer group hover:opacity-80 transition-opacity text-center"
                      title="Click to view detailed student feedback & ratings"
                    >
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-amber-600">
                        Rating
                      </span>
                      <span className="text-xs font-black text-amber-500 flex items-center justify-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{staff.rating || 4.9}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({staff.reviewCount || 0})</span>
                      </span>
                    </button>
                  </div>

                  {/* Contact Strip */}
                  <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-1 text-xs">
                    <a
                      href={`mailto:${staff.email}`}
                      className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11px] truncate">{staff.email}</span>
                    </a>
                    {staff.phoneNumber && (
                      <a
                        href={`tel:${staff.phoneNumber}`}
                        className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[11px]">+91 {staff.phoneNumber}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Card Action Footer: Attendance Toggle, Student Feedback & Assign */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <Button
                    variant={isPresent ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => handleTogglePresence(staff._id, isPresent)}
                    isLoading={isUpdatingPresenceId === staff._id}
                    className="text-xs font-bold flex-1 min-w-[110px]"
                  >
                    {isPresent ? 'Mark Off-Duty' : 'Check In'}
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={Star}
                    onClick={() => setSelectedStaffForFeedback(staff)}
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 px-2.5"
                    title="Inspect Student Feedback & Star Ratings"
                  >
                    Feedback ({staff.reviewCount || 0})
                  </Button>

                  <Link to={`/admin/complaints`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      rightIcon={ArrowRight}
                      className="text-xs font-semibold px-2"
                      title="Dispatch ticket to technician"
                    >
                      Dispatch
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABULAR OPERATIONS VIEW */
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Technician</th>
                  <th className="px-5 py-3.5">Trade & Specialty</th>
                  <th className="px-5 py-3.5">Shift Schedule</th>
                  <th className="px-5 py-3.5">Presence / Duty</th>
                  <th className="px-5 py-3.5 text-center">Active Queue</th>
                  <th className="px-5 py-3.5 text-center">Resolved Fixes</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredStaff.map((staff) => {
                  const isPresent = staff.isPresent !== false;
                  return (
                    <tr
                      key={staff._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {staff.name ? staff.name.slice(0, 2).toUpperCase() : 'TC'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                              <span>{staff.name}</span>
                              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono">{staff.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Trade / Specialty */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{staff.department}</div>
                        <div className="text-[11px] text-slate-400">{staff.specialty || 'General Maintenance'}</div>
                      </td>

                      {/* Shift */}
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {staff.shift || 'Morning Shift'}
                      </td>

                      {/* Presence / Attendance */}
                      <td className="px-5 py-3.5">
                        {isPresent ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Present</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span>Off-Duty</span>
                          </span>
                        )}
                      </td>

                      {/* Active Queue */}
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={cn(
                            'font-bold px-2 py-0.5 rounded-lg text-xs',
                            staff.activeTasks > 0
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                              : 'text-slate-400'
                          )}
                        >
                          {staff.activeTasks || 0}
                        </span>
                      </td>

                      {/* Completed */}
                      <td className="px-5 py-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                        {staff.completedTasks || 0}
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-3.5 text-[11px] font-mono">
                        {staff.phoneNumber ? `+91 ${staff.phoneNumber}` : staff.email}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={Star}
                          onClick={() => setSelectedStaffForFeedback(staff)}
                          className="text-xs py-1 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40 hover:bg-amber-100"
                        >
                          Feedback ({staff.reviewCount || 0})
                        </Button>

                        <Button
                          variant={isPresent ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => handleTogglePresence(staff._id, isPresent)}
                          isLoading={isUpdatingPresenceId === staff._id}
                          className="text-xs py-1"
                        >
                          {isPresent ? 'Mark Off' : 'Check In'}
                        </Button>

                        <Link to="/admin/complaints">
                          <Button variant="ghost" size="sm" rightIcon={ArrowRight} className="text-xs py-1">
                            Dispatch
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Access Key & Onboarding Guidance Banner */}
      <div className="rounded-2xl border border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-r from-indigo-50/60 via-purple-50/30 to-blue-50/40 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-blue-950/20 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Technician Onboarding Access Protocol
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl">
              New maintenance staff register with role <strong>&quot;Staff&quot;</strong> using the secure estate access key <code className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 font-mono font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">STAFF2026</code>. Their profile will immediately populate this roster upon verification.
            </p>
          </div>

          <Link to="/register">
            <Button variant="outline" size="sm" className="text-xs whitespace-nowrap bg-white dark:bg-slate-800">
              Register New Staff
            </Button>
          </Link>
        </div>
      </div>

      {/* Technician Student Feedback Audit Modal */}
      <TechnicianFeedbackModal
        staff={selectedStaffForFeedback}
        isOpen={Boolean(selectedStaffForFeedback)}
        onClose={() => setSelectedStaffForFeedback(null)}
      />
    </div>
  );
};

export default StaffDirectoryPage;
