import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatCard from '../../components/common/StatCard';
import Badge, { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Select from '../../components/forms/Select';
import { Spinner } from '../../components/common/Spinner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Shield,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Building2,
  Wrench,
  CheckCircle2,
  Calendar,
  Send,
  Sparkles,
  BarChart3,
  Sliders,
  ChevronRight,
  UserCheck,
  Layers,
  Activity,
  Cpu,
  Radio,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/axiosInstance';
import { useThemeStore } from '../../store/themeStore';
import { OverdueComplaintsWidget } from '../../components/common/OverdueComplaintsWidget';

export const AdminDashboard = () => {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const [analytics, setAnalytics] = useState(null);
  const [urgentComplaints, setUrgentComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Dispatch Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('high');
  const [isAssigning, setIsAssigning] = useState(false);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, complaintsRes, staffRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/complaints', { params: { status: 'submitted', limit: 6 } }),
        api.get('/admin/staff'),
      ]);
      setAnalytics(analyticsRes);
      setUrgentComplaints(complaintsRes.complaints || []);
      setStaffList(staffRes.staff || []);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAssign = (ticket) => {
    setSelectedTicket(ticket);
    setSelectedPriority(ticket.priority || 'high');
    setSelectedStaffId(ticket.assignedStaff?._id || (staffList[0]?._id || ''));
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = async () => {
    if (!selectedTicket?._id || !selectedStaffId) {
      alert('Please select a technician to dispatch.');
      return;
    }

    setIsAssigning(true);
    try {
      await api.post('/admin/assign', {
        complaintId: selectedTicket._id,
        staffId: selectedStaffId,
        priority: selectedPriority,
      });
      setIsAssignModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to dispatch staff.');
    } finally {
      setIsAssigning(false);
    }
  };

  const kpi = analytics?.kpi || {
    totalComplaints: 12,
    submitted: 3,
    assigned: 2,
    inProgress: 3,
    resolved: 4,
    resolutionRate: 75,
  };

  // Recharts Activity Trend
  const activityData = useMemo(() => {
    return [
      { day: 'Mon', intake: 8, resolved: 6 },
      { day: 'Tue', intake: 12, resolved: 10 },
      { day: 'Wed', intake: 9, resolved: 9 },
      { day: 'Thu', intake: 15, resolved: 14 },
      { day: 'Fri', intake: 11, resolved: 10 },
      { day: 'Sat', intake: 5, resolved: 5 },
      { day: 'Sun', intake: 4, resolved: 4 },
    ];
  }, []);

  // Category Donut Distribution
  const categoryStats = useMemo(() => {
    if (analytics?.categoryStats && analytics.categoryStats.length > 0) {
      const colors = ['#4f46e5', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];
      return analytics.categoryStats.map((c, i) => ({
        name: c.name,
        value: c.total,
        color: colors[i % colors.length],
      }));
    }
    return [
      { name: 'IT / AV', value: 24, color: '#4f46e5' },
      { name: 'Electrical', value: 32, color: '#f59e0b' },
      { name: 'Plumbing', value: 18, color: '#3b82f6' },
      { name: 'Furniture', value: 12, color: '#8b5cf6' },
      { name: 'HVAC', value: 15, color: '#10b981' },
    ];
  }, [analytics]);

  // Campus Facility Zones Health
  const facilityZones = [
    { name: 'Academic Block C (Engineering)', health: 94, status: 'Optimal', open: 2, color: 'bg-emerald-500' },
    { name: 'Central University Library', health: 98, status: 'Optimal', open: 0, color: 'bg-emerald-500' },
    { name: 'Advanced Science & Tech Labs', health: 82, status: 'Degraded', open: 3, color: 'bg-amber-500' },
    { name: 'Boys Hostel Wing A & B', health: 88, status: 'Attention', open: 2, color: 'bg-amber-500' },
    { name: 'Girls Hostel Wing C', health: 96, status: 'Optimal', open: 1, color: 'bg-emerald-500' },
    { name: 'Indoor Sports Arena', health: 100, status: 'Optimal', open: 0, color: 'bg-emerald-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6 pb-12"
    >
      {/* 1. Futuristic Operations Command Radar Console */}
      <div className="relative overflow-hidden rounded-3xl bg-[#090d16] text-white p-6 sm:p-8 border border-indigo-900/50 shadow-hud-indigo">
        {/* Animated Cyber Glow Orbs & Grid */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            x: [0, 25, 0],
            y: [0, -15, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 right-1/3 -mb-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"
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
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[11px] border border-indigo-500/40 shadow-glow-indigo">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span>⚡ CENTRAL COMMAND HUD v2.6</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 font-mono text-[11px]">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" /> MESH: ONLINE
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> {todayFormatted}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Facility Triage &amp; Dispatch Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Real-time telemetry monitor for campus maintenance tickets, certified technician allocation, and university SLA turnaround enforcement.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchData}
              leftIcon={RefreshCw}
              isLoading={isLoading}
              className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80"
            >
              Sync Grid
            </Button>
            <Link to="/admin/analytics">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={BarChart3}
                className="bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-600/40 shadow-glow-indigo"
              >
                Telemetry
              </Button>
            </Link>
            <Link to="/admin/complaints">
              <Button
                variant="primary"
                size="sm"
                rightIcon={ArrowUpRight}
                className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold shadow-glow-indigo"
              >
                Triage Queue ({kpi.submitted})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Five Premium StatCards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCard
          title="Total Issues"
          value={isLoading ? '-' : kpi.totalComplaints}
          description="Logged in campus registry"
          icon={Layers}
          variant="indigo"
          trend={{ value: '+14%', isPositive: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="Pending Triage"
          value={isLoading ? '-' : kpi.submitted}
          description="Awaiting staff dispatch"
          icon={Clock}
          variant="rose"
          trend={{ value: 'Action Required', isNeutral: false }}
          isLoading={isLoading}
        />
        <StatCard
          title="In Progress"
          value={isLoading ? '-' : kpi.inProgress + kpi.assigned}
          description="Technicians on-site"
          icon={Wrench}
          variant="amber"
          isLoading={isLoading}
        />
        <StatCard
          title="Resolved"
          value={isLoading ? '-' : kpi.resolved}
          description="Photo verified fixes"
          icon={CheckCircle2}
          variant="emerald"
          trend={{ value: '+32%', isPositive: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="SLA Compliance"
          value={isLoading ? '-' : `${kpi.resolutionRate}%`}
          description="Target benchmark: ≥ 90%"
          icon={TrendingUp}
          variant="blue"
          trend={{ value: 'Optimal', isPositive: true }}
          isLoading={isLoading}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* 3. Analytics Charts (Line & Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Ingestion & Resolution Area Chart */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="lg:col-span-7 rounded-2xl border border-slate-200/80 dark:border-indigo-950/60 bg-white dark:bg-[#0c1220] p-5 shadow-hud-indigo relative overflow-hidden space-y-4"
        >
          {/* Tech corner accent */}
          <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-indigo-500/50 pointer-events-none" />

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Weekly Triage Intake vs Resolution Velocity
                </h3>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                Real-time incident dispatch rate across 7 days
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-cyan-400 bg-indigo-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-cyan-800/40">
              ⚡ LIVE TELEMETRY
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminIntake" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="adminResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0c1220' : '#ffffff',
                    borderRadius: '0.75rem',
                    border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
                    fontSize: '12px',
                    color: isDark ? '#f1f5f9' : '#0f172a',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                  }}
                  itemStyle={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
                />
                <Area
                  type="monotone"
                  dataKey="intake"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#adminIntake)"
                  name="Ingested Issues"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#adminResolved)"
                  name="Resolved"
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: '10px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right 5 Cols: Category Distribution Donut */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="lg:col-span-5 rounded-2xl border border-slate-200/80 dark:border-indigo-950/60 bg-white dark:bg-[#0c1220] p-5 shadow-hud-indigo relative overflow-hidden space-y-4"
        >
          {/* Tech corner accent */}
          <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500/50 pointer-events-none" />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Category Frequency</h3>
              <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">Campus maintenance allocation by domain</p>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-cyan-400 bg-slate-100 dark:bg-cyan-950/40 px-2 py-0.5 rounded-md border border-slate-200 dark:border-cyan-800/40">
              SLA RADAR
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={48}
                  paddingAngle={3}
                >
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#0c1220' : '#ffffff',
                    borderRadius: '0.75rem',
                    border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
                    fontSize: '12px',
                    color: isDark ? '#f1f5f9' : '#0f172a',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                  }}
                  itemStyle={{ color: isDark ? '#f1f5f9' : '#0f172a' }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* SLA Breach Sentinel: Overdue Incidents & Escalation Control */}
      <OverdueComplaintsWidget />

      {/* 4. Urgent Triage Table & Campus Facility Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Urgent Triage Queue */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 dark:border-indigo-950/60 bg-white dark:bg-[#0c1220] shadow-hud-indigo overflow-hidden relative">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Urgent Triage &amp; Dispatch Queue</h3>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                Issues pending staff assignment. Click &quot;Dispatch&quot; to assign a certified technician.
              </p>
            </div>
            <Link to="/admin/complaints">
              <Button variant="ghost" size="sm" rightIcon={ChevronRight} className="text-xs">
                Full Queue
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Spinner size="md" />
            </div>
          ) : urgentComplaints.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No Pending Triage Tickets</p>
              <p className="text-slate-400">All submitted campus complaints have been dispatched to technicians.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Tracking ID</th>
                    <th className="px-5 py-3">Issue Title</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3 text-right">Quick Dispatch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {urgentComplaints.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-950/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-indigo-600 dark:text-cyan-400">
                        <Link to={`/track?id=${ticket.trackingId}`} className="hover:underline">
                          {ticket.trackingId}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">{ticket.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {ticket.category?.name} • Reported by {ticket.student?.name}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">{ticket.location?.building}</div>
                        <div className="text-[11px] text-slate-400">{ticket.location?.room}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={UserCheck}
                          onClick={() => handleOpenAssign(ticket)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-xs py-1 shadow-glow-indigo"
                        >
                          Dispatch Staff
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right 4 Cols: Campus Facility Readiness Matrix */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 dark:border-indigo-950/60 bg-white dark:bg-[#0c1220] p-5 shadow-hud-indigo space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
              Zone Readiness
            </h3>
            <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
              93% OPTIMAL
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {facilityZones.map((zone, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-1.5 hover:border-indigo-500/30 transition-colors">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{zone.name}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${zone.status === 'Optimal' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}
                  >
                    {zone.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Readiness: {zone.health}%</span>
                  <span>{zone.open} Open Tickets</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className={`${zone.color} h-1.5 rounded-full`} style={{ width: `${zone.health}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dispatch Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Dispatch Maintenance Technician"
      >
        {selectedTicket && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{selectedTicket.trackingId}</span>
                <PriorityBadge priority={selectedTicket.priority} />
              </div>
              <p className="font-bold text-slate-900 dark:text-white">{selectedTicket.title}</p>
              <p className="text-slate-500 dark:text-slate-400">
                {selectedTicket.location?.building} • {selectedTicket.location?.room}
              </p>
            </div>

            <Select
              label="Select Available Technician"
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              options={staffList.map((st) => ({
                value: st._id,
                label: `${st.name} (${st.department})`,
              }))}
            />

            <Select
              label="Enforce Ticket Priority"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              options={[
                { value: 'low', label: 'Low (Within 48 hours)' },
                { value: 'medium', label: 'Medium (Within 24 hours)' },
                { value: 'high', label: 'High (Within 8 hours)' },
                { value: 'urgent', label: 'Urgent (Within 2 hours)' },
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
    </motion.div>
  );
};

export default AdminDashboard;
