import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Clock, RefreshCw, Calendar, ArrowRight, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './Button';
import Modal from './Modal';
import Input from '../forms/Input';
import SLACountdown from './SLACountdown';
import { Spinner } from './Spinner';
import { cn } from '../../utils/cn';
import api from '../../services/axiosInstance';

/**
 * Admin SLA Monitoring & Overdue Complaints Panel
 */
export const OverdueComplaintsWidget = ({ className }) => {
  const [overdueList, setOverdueList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adjustModalTicket, setAdjustModalTicket] = useState(null);
  const [newDeadlineDate, setNewDeadlineDate] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchOverdue = async () => {
    try {
      const res = await api.get('/complaints/overdue');
      setOverdueList(res.overdue || []);
    } catch (err) {
      console.error('Failed to load overdue complaints:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverdue();
  }, []);

  const handleRunEscalation = async () => {
    setIsProcessing(true);
    setActionSuccess('');
    try {
      const res = await api.post('/complaints/process-escalations');
      setActionSuccess(res.message);
      fetchOverdue();
    } catch (err) {
      console.error('Escalation processing failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdjustDeadlineSubmit = async (e) => {
    e.preventDefault();
    if (!newDeadlineDate || !adjustReason.trim()) return;

    try {
      await api.put(`/complaints/${adjustModalTicket._id}/deadline`, {
        newDeadline: newDeadlineDate,
        reason: adjustReason.trim(),
      });
      setAdjustModalTicket(null);
      setNewDeadlineDate('');
      setAdjustReason('');
      fetchOverdue();
    } catch (err) {
      alert(err.message || 'Failed to adjust deadline.');
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-200/90 dark:border-rose-900/40 bg-white dark:bg-[#111827] p-5 shadow-premium space-y-4 transition-colors',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              SLA Overdue Monitor
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                {overdueList.length} Breaches
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Active campus complaints past target service resolution SLA
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRunEscalation}
          isLoading={isProcessing}
          leftIcon={RefreshCw}
          className="text-xs py-1 self-start sm:self-auto"
        >
          Check & Escalate
        </Button>
      </div>

      {actionSuccess && (
        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
          {actionSuccess}
        </div>
      )}

      {isLoading ? (
        <div className="py-8 flex justify-center">
          <Spinner size="md" />
        </div>
      ) : overdueList.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl">
          🎉 Excellent! All campus complaints are currently resolving within target SLA.
        </div>
      ) : (
        <div className="space-y-3">
          {overdueList.slice(0, 5).map((ticket) => (
            <div
              key={ticket._id}
              className="p-3.5 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/20 dark:bg-rose-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-rose-700 dark:text-rose-400">
                    {ticket.trackingId}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {ticket.location?.building} • {ticket.location?.room}
                  </span>
                  {ticket.escalationLevel > 0 && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-600 text-white">
                      L{ticket.escalationLevel} Escalated
                    </span>
                  )}
                </div>

                <Link
                  to={`/track?id=${ticket.trackingId}`}
                  className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 line-clamp-1 block"
                >
                  {ticket.title}
                </Link>

                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>Assigned: <strong>{ticket.assignedStaff?.name || 'Unassigned'}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <SLACountdown deadline={ticket.slaDeadline} status={ticket.status} />

                <button
                  type="button"
                  onClick={() => setAdjustModalTicket(ticket)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs"
                  title="Extend or adjust deadline with audit log"
                >
                  Extend SLA
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adjust Deadline Modal */}
      {adjustModalTicket && (
        <Modal
          isOpen={!!adjustModalTicket}
          onClose={() => setAdjustModalTicket(null)}
          title={`Adjust SLA Target: ${adjustModalTicket.trackingId}`}
          description="Extend resolution deadline with mandatory administrative audit justification."
        >
          <form onSubmit={handleAdjustDeadlineSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">{adjustModalTicket.title}</span>
              <span className="text-slate-400">
                Current Deadline: {new Date(adjustModalTicket.slaDeadline).toLocaleString()}
              </span>
            </div>

            <Input
              label="New Resolution Target Date & Time"
              type="datetime-local"
              value={newDeadlineDate}
              onChange={(e) => setNewDeadlineDate(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Audit Reason for Extension <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Awaiting specialized HVAC compressor spare part shipment from vendor..."
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setAdjustModalTicket(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="font-bold">
                Save & Log Audit Trail
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default OverdueComplaintsWidget;
