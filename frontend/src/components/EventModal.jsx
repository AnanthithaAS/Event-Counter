import React, { useState, useEffect } from 'react';
import { toDatetimeLocalString, fromDatetimeLocalToISO } from '../utils/dateUtils';
import { X, Calendar, Type, Tag, AlignLeft, Loader2, Timer } from 'lucide-react';

const CATEGORIES = ['General', 'Birthday', 'Vacation', 'Exam', 'Work', 'Celebration', 'Personal'];

export default function EventModal({ isOpen, onClose, onSave, initialData = null, isSubmitting = false }) {
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setTargetDate(toDatetimeLocalString(initialData.target_date));
        setCategory(initialData.category || 'General');
        setDescription(initialData.description || '');
      } else {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        defaultDate.setMinutes(0);
        defaultDate.setSeconds(0);
        setTitle('');
        setTargetDate(toDatetimeLocalString(defaultDate));
        setCategory('General');
        setDescription('');
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Event title is required.';
    }
    if (!targetDate) {
      newErrors.targetDate = 'Target date & time is required.';
    } else {
      const parsed = new Date(targetDate);
      if (isNaN(parsed.getTime())) {
        newErrors.targetDate = 'Please provide a valid date & time.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const isoDate = fromDatetimeLocalToISO(targetDate);
    onSave({
      title: title.trim(),
      target_date: isoDate,
      category,
      description: description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xl relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Timer className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {initialData ? 'Edit Countdown Event' : 'Create New Countdown'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-blue-600" />
              Event Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="event-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Vacation, Birthday Party, Final Exam"
              className="glass-input w-full text-sm"
              autoFocus
            />
            {errors.title && <p className="text-rose-600 text-xs mt-1 font-medium">{errors.title}</p>}
          </div>

          {/* Target Date & Time */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Target Date & Time <span className="text-rose-500">*</span>
            </label>
            <input
              id="event-target-date-input"
              type="datetime-local"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="glass-input w-full text-sm font-mono"
            />
            {errors.targetDate && <p className="text-rose-600 text-xs mt-1 font-medium">{errors.targetDate}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    category === cat
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-blue-600" />
              Notes / Description (Optional)
            </label>
            <textarea
              id="event-description-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add reminders, travel itinerary, or notes..."
              className="glass-input w-full text-sm resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-secondary text-sm py-2 px-4"
            >
              Cancel
            </button>
            <button
              id="save-event-btn"
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-sm py-2 px-5 gap-2 flex items-center font-semibold"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{initialData ? 'Save Changes' : 'Create Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
