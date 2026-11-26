import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/forms/Input';
import {
  Tags,
  Clock,
  Plus,
  Tv,
  Zap,
  Droplet,
  Armchair,
  Wind,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([
    { id: '1', name: 'IT & Smart Classrooms', defaultSlaHours: 12, count: 24, icon: Tv, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { id: '2', name: 'Electrical & Power Grid', defaultSlaHours: 8, count: 32, icon: Zap, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { id: '3', name: 'Plumbing & Sanitation', defaultSlaHours: 6, count: 18, icon: Droplet, color: 'text-sky-600 bg-sky-50 border-sky-200' },
    { id: '4', name: 'Civil & Furniture', defaultSlaHours: 48, count: 12, icon: Armchair, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { id: '5', name: 'HVAC & Climate Control', defaultSlaHours: 24, count: 15, icon: Wind, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSla, setNewCatSla] = useState(24);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCategories((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: newCatName.trim(),
        defaultSlaHours: Number(newCatSla) || 24,
        count: 0,
        icon: Tags,
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      },
    ]);
    setNewCatName('');
    setNewCatSla(24);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
              Service Registry
            </span>
            <span className="text-xs text-slate-400 font-medium">{categories.length} Managed Domains</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Issue Categories & SLA Configuration
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Configure campus maintenance domains and default SLA target deadlines.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={Plus}
          onClick={() => setIsModalOpen(true)}
          className="font-bold text-xs"
        >
          Add Custom Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-premium hover:shadow-premium-hover transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${cat.color} dark:bg-slate-800 dark:border-slate-700`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{cat.name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">Active Campus Service</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Target SLA Turnaround:</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> &lt; {cat.defaultSlaHours} Hours
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Total Tracked Tickets:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{cat.count} Issues</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Category Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Maintenance Category">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Laboratory Equipment / Solar Grid"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            required
          />
          <Input
            label="Target SLA Turnaround (Hours)"
            type="number"
            min="1"
            max="168"
            value={newCatSla}
            onChange={(e) => setNewCatSla(e.target.value)}
            required
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" className="font-bold">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoryManagementPage;
