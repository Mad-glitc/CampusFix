import React, { useState } from 'react';
import { Megaphone, AlertTriangle, Send, X, Eye, EyeOff, MapPin, Users, Calendar } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import Input from '../forms/Input';
import Select from '../forms/Select';
import { cn } from '../../utils/cn';
import api from '../../services/axiosInstance';

const CATEGORIES = [
  'General Announcement',
  'Electricity Maintenance',
  'Water Supply Disruption',
  'Wi-Fi Outage',
  'Building Maintenance',
  'Cleaning Schedule',
  'Emergency Notice',
];

const PRIORITIES = [
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High Priority' },
  { value: 'emergency', label: 'Emergency Notice' },
  { value: 'low', label: 'Routine / Low' },
];

export const AnnouncementEditor = ({ isOpen, onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General Announcement',
    priority: 'normal',
    targetLocations: 'Engineering Block C',
    targetAudience: 'all',
    isEmergency: false,
    expiresAt: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please provide title and content.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const locations = formData.targetLocations
        ? formData.targetLocations.split(',').map((l) => l.trim()).filter(Boolean)
        : [];

      const payload = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        priority: formData.priority,
        targetLocations: locations,
        targetAudience: [formData.targetAudience],
        isEmergency: formData.isEmergency || formData.priority === 'emergency',
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null,
      };

      const res = await api.post('/announcements', payload);
      if (onCreated) onCreated(res.announcement);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to publish announcement.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Broadcast Campus Announcement"
      description="Publish maintenance schedules, emergency notices, or facility advisories."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs rounded-xl bg-rose-50 text-rose-800 border border-rose-200">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Announcement Configuration
          </span>
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            {isPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isPreview ? 'Back to Editor' : 'Live Preview'}</span>
          </button>
        </div>

        {isPreview ? (
          <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/20 dark:bg-slate-900 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {formData.category}
              </span>
              {formData.priority === 'emergency' && (
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white">
                  Emergency
                </span>
              )}
            </div>
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              {formData.title || 'Untitled Notice'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {formData.content || 'Content will appear here...'}
            </p>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <MapPin className="w-3.5 h-3.5" />
              <span>Target: {formData.targetLocations || 'Entire Campus'}</span>
            </div>
          </div>
        ) : (
          <>
            <Input
              label="Announcement Title"
              name="title"
              placeholder="e.g. Scheduled Water Maintenance in Block C"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={CATEGORIES}
              />

              <Select
                label="Priority Level"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={PRIORITIES}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Target Locations (Comma separated)"
                name="targetLocations"
                placeholder="e.g. Engineering Block C, Science Block B"
                value={formData.targetLocations}
                onChange={handleChange}
                helperText="Leave empty to target all campus buildings."
              />

              <Select
                label="Target Audience"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                options={[
                  { value: 'all', label: 'All Users (Students, Staff, Admin)' },
                  { value: 'student', label: 'Students Only' },
                  { value: 'staff', label: 'Technician Staff Only' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Notice Content & Instructions <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                name="content"
                placeholder="Provide detailed instructions, timings, affected facilities, and alternative amenities..."
                value={formData.content}
                onChange={handleChange}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 font-medium leading-relaxed"
                required
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            leftIcon={Send}
            className="font-bold text-xs shadow-xs"
          >
            Publish Announcement
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AnnouncementEditor;
