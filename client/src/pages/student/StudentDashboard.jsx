import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import Badge, { StatusBadge, PriorityBadge } from '../../components/common/Badge';
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
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Building2,
  MapPin,
  TrendingUp,
  Search,
  Zap,
  Droplet,
  Tv,
  Wind,
  Armchair,
  ExternalLink,
  Layers,
  ChevronRight,
  Calendar,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import api from '../../services/axiosInstance';
import { cn } from '../../utils/cn';
import { AnnouncementBanner } from '../../components/common/AnnouncementBanner';
import { TrendingIssues } from '../../components/common/TrendingIssues';

export const StudentDashboard = () => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [quickTrackInput, setQuickTrackInput] = useState('');

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
      const [compRes, anaRes, annRes] = await Promise.all([
        api.get('/complaints', { params: { limit: 10 } }),
        api.get('/admin/analytics').catch(() => null),
        api.get('/announcements').catch(() => ({ announcements: [] })),
      ]);
      setComplaints(compRes.complaints || []);
      setAnalyticsData(anaRes);
      setAnnouncements(annRes.announcements || []);
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Prioritized announcement banner (Active Emergency alert > Resolved notice > Latest active notice)
  const urgentAnnouncement = useMemo(() => {
    if (!announcements.length) return null;
    const activeEmergency = announcements.find(
      (a) => !a.isResolved && (a.isEmergency || a.priority === 'emergency')
    );
    if (activeEmergency) return activeEmergency;
    const recentlyResolved = announcements.find((a) => a.isResolved || a.status === 'resolved');
    if (recentlyResolved) return recentlyResolved;
    return announcements[0];
  }, [announcements]);

  // Filtered complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        searchFilter === '' ||
        c.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.trackingId.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (c.location?.building && c.location.building.toLowerCase().includes(searchFilter.toLowerCase())) ||
        (c.location?.room && c.location.room.toLowerCase().includes(searchFilter.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterTab === 'active') {
        return c.status === 'submitted' || c.status === 'assigned' || c.status === 'in_progress';
      }
      if (filterTab === 'resolved') {
        return c.status === 'resolved';
      }
      return true;
    });
  }, [complaints, filterTab, searchFilter]);

  // Dynamic statistics
  const stats = useMemo(() => {
    const pending = complaints.filter((c) => c.status === 'submitted' || c.status === 'assigned').length;
    const inProgress = complaints.filter((c) => c.status === 'in_progress').length;
    const resolved = complaints.filter((c) => c.status === 'resolved').length;
    const total = complaints.length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 100;
    return { pending, inProgress, resolved, total, rate };
  }, [complaints]);

  // Chart data for activity line/area
  const activityTrends = useMemo(() => {
    return [
      { day: 'Mon', issues: 4, resolved: 3 },
      { day: 'Tue', issues: 7, resolved: 6 },
      { day: 'Wed', issues: 5, resolved: 5 },
      { day: 'Thu', issues: 9, resolved: 8 },
      { day: 'Fri', issues: 6, resolved: 5 },
      { day: 'Sat', issues: 3, resolved: 3 },
      { day: 'Sun', issues: 2, resolved: 2 },
    ];
  }, []);

  // Donut distribution data
  const categoryDistribution = useMemo(() => {
    if (analyticsData?.categoryStats && analyticsData.categoryStats.length > 0) {
      const colors = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
      return analyticsData.categoryStats.map((cat, idx) => ({
        name: cat.name,
        value: cat.total,
        color: colors[idx % colors.length],
      }));
    }
    return [
      { name: 'IT / AV', value: 24, color: '#4f46e5' },
      { name: 'Electrical', value: 32, color: '#f59e0b' },
      { name: 'Plumbing', value: 18, color: '#3b82f6' },
      { name: 'Furniture', value: 12, color: '#8b5cf6' },
      { name: 'HVAC', value: 15, color: '#10b981' },
    ];
  }, [analyticsData]);

  // Quick 1-click issue reporting templates
  const quickTemplates = [
    {
      title: 'Classroom Projector',
      cat: 'it_av',
      desc: 'Projector display flickering / HDMI no signal',
      icon: Tv,
      color: 'hover:border-indigo-400 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'Power Socket Spark',
      cat: 'electrical',
      desc: 'Wall outlet damaged or circuit tripped',
      icon: Zap,
      color: 'hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Hydration Station / Tap',
      cat: 'plumbing',
      desc: 'Restroom tap leaking or water cooler offline',
      icon: Droplet,
      color: 'hover:border-sky-400 hover:bg-sky-50/40 dark:hover:bg-sky-950/20 text-sky-600 dark:text-sky-400',
    },
    {
      title: 'AC Climate Control',
      cat: 'hvac',
      desc: 'Thermostat failure or insufficient cooling',
      icon: Wind,
      color: 'hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Furniture / Door Lock',
      cat: 'furniture',
      desc: 'Broken bench, study desk, or latch malfunction',
      icon: Armchair,
      color: 'hover:border-purple-400 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 0. Campus Emergency / Critical Notice Alert Banner */}
      {urgentAnnouncement && (
        <AnnouncementBanner announcement={urgentAnnouncement} />
      )}

      {/* 1. Futuristic Cyber Hologram Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-[#0d1424] to-slate-950 text-white p-6 sm:p-8 border border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.2)]"
      >
        {/* Animated Background Mesh Orbs */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-20 right-1/4 w-72 h-72 rounded-full bg-indigo-600/25 blur-3xl pointer-events-none"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 font-mono font-bold border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                NEURAL DISPATCH TERMINAL v2.6
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> {todayFormatted}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Good day, <span className="cyber-text font-black">{user?.name || 'Student'}</span>!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Report campus infrastructure anomalies, dispatch technician personnel in real-time, and monitor verified photographic resolution SLAs with autonomous escalation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/student/report">
              <Button
                variant="primary"
                size="md"
                leftIcon={PlusCircle}
                className="font-bold bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-600/40 hover:shadow-glow-indigo px-5 py-2.5 cursor-pointer"
              >
                Report Anomaly
              </Button>
            </Link>
            <Link to="/student/complaints">
              <Button
                variant="secondary"
                size="md"
                className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold cursor-pointer shadow-xs"
              >
                Track Tickets ({complaints.length})
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 2. Five Premium Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCard
          title="Total Issues"
          value={isLoading ? '-' : stats.total}
          description="Reported this semester"
          icon={Layers}
          variant="indigo"
          trend={{ value: '+12%', isPositive: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="Pending Issues"
          value={isLoading ? '-' : stats.pending}
          description="Awaiting staff dispatch"
          icon={Clock}
          variant="rose"
          trend={{ value: 'Active', isNeutral: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="In Progress"
          value={isLoading ? '-' : stats.inProgress}
          description="Technician on-site"
          icon={AlertTriangle}
          variant="amber"
          isLoading={isLoading}
        />
        <StatCard
          title="Resolved Issues"
          value={isLoading ? '-' : stats.resolved}
          description="Photo verified fixes"
          icon={CheckCircle2}
          variant="emerald"
          trend={{ value: '+28%', isPositive: true }}
          isLoading={isLoading}
        />
        <StatCard
          title="Resolution Rate"
          value={isLoading ? '-' : `${stats.rate}%`}
          description="Campus SLA benchmark"
          icon={TrendingUp}
          variant="blue"
          trend={{ value: 'Target Met', isPositive: true }}
          isLoading={isLoading}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* 3. 1-Click Quick Issue Launch Dock */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-premium space-y-3 transition-colors duration-150">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Quick Issue Dispatch Templates
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Select a frequent campus problem to pre-fill category details and SLA targets instantly.
            </p>
          </div>
          <Sparkles className="w-4 h-4 text-indigo-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {quickTemplates.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={idx}
                type="button"
                whileHover={{ scale: 1.035, y: -3 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                onClick={() =>
                  navigate(
                    `/student/report?cat=${item.cat}&title=${encodeURIComponent(
                      item.title
                    )}&desc=${encodeURIComponent(item.desc)}`
                  )
                }
                className={cn(
                  'p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md text-left transition-all duration-200 flex flex-col justify-between group hover:shadow-card-hover cursor-pointer relative overflow-hidden',
                  item.color
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-2xs border border-slate-200/60 dark:border-slate-700/80 flex items-center justify-center transition-transform group-hover:scale-110">
                    <Icon className="w-4 h-4" />
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 4. Analytics Section (Line & Donut Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Activity Line/Area Chart */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-premium space-y-4 transition-colors duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Weekly Issue Ingestion & Resolution Activity
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Daily volume of submitted complaints vs resolved tasks across campus
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800/40">
              Activity Metrics
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: theme === 'dark' ? '#94a3b8' : '#64748b' }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                    color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="issues"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIssues)"
                  name="Issues Logged"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                  name="Resolved"
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: '10px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 5 Cols: Category Distribution Donut Chart */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-premium space-y-4 transition-colors duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Category Distribution
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Proportion of campus maintenance tickets by trade
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              SLA Monitored
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={48}
                  paddingAngle={3}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
                    borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                    color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Recent Complaints Data Table & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Filterable Data Table */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-premium overflow-hidden transition-colors duration-150">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Campus Complaints</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Real-time tracking of active and historical tickets
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80">
              {['all', 'active', 'resolved'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterTab(tab)}
                  className={cn(
                    'px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer',
                    filterTab === tab
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Search Toolbar */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Filter by title, room, or ticket ID..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <Spinner size="md" />
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400 dark:text-slate-500">
              No complaints found matching the criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50/70 dark:bg-slate-900/70 border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Tracking ID</th>
                    <th className="px-5 py-3">Issue Title</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredComplaints.slice(0, 6).map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        <Link to={`/track?id=${item.trackingId}`} className="hover:underline">
                          {item.trackingId}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                        {item.title}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                        {item.location?.building} • {item.location?.room}
                      </td>
                      <td className="px-5 py-3.5">
                        <PriorityBadge priority={item.priority} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={item.status} />
                        {item.feedback?.rating ? (
                          <span className="text-[10px] font-bold text-amber-500 block mt-0.5">
                            ⭐ {item.feedback.rating}/5 Reviewed
                          </span>
                        ) : null}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link to={`/track?id=${item.trackingId}`}>
                          <Button variant="ghost" size="sm" rightIcon={ArrowRight} className="text-xs py-1">
                            Track
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 text-center">
            <Link
              to="/student/complaints"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 inline-flex items-center gap-1"
            >
              View Full Incident Registry ({complaints.length}) <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right 4 Cols: Latest Activity Timeline & Instant Lookup */}
        <div className="lg:col-span-4 space-y-6">
          {/* Community Trending & Most Supported Issues */}
          <TrendingIssues />

          {/* Quick Ticket Lookup Widget */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-premium space-y-3 transition-colors duration-150">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Instant Ticket Audit
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Have a tracking ID? Check live technician status without signing in.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (quickTrackInput.trim()) {
                  navigate(`/track?id=${encodeURIComponent(quickTrackInput.trim())}`);
                }
              }}
              className="space-y-2 pt-1"
            >
              <input
                type="text"
                placeholder="e.g. CF-2026-3969"
                value={quickTrackInput}
                onChange={(e) => setQuickTrackInput(e.target.value)}
                className="w-full text-xs font-mono uppercase px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-semibold"
              />
              <Button type="submit" variant="primary" size="sm" className="w-full font-bold">
                Lookup Status
              </Button>
            </form>
          </div>

          {/* Real-time Activity Timeline */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-premium space-y-4 transition-colors duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Live Incident Stream
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Projector Repair Dispatched</p>
                  <p className="text-slate-400 dark:text-slate-500 text-[11px]">Block C Room 402 • 10m ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Water Cooler Filter Replaced</p>
                  <p className="text-slate-400 dark:text-slate-500 text-[11px]">Central Library • 45m ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Circuit Breaker Inspected</p>
                  <p className="text-slate-400 dark:text-slate-500 text-[11px]">Science Labs • 2h ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
