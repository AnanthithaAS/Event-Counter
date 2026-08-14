import React from 'react';
import CountdownTimer from './CountdownTimer';
import { formatDisplayDate } from '../utils/dateUtils';
import { getRemainingTime } from '../utils/countdown';
import { Calendar, Edit3, Trash2, Tag, Clock } from 'lucide-react';

const CATEGORY_COLORS = {
  Birthday: 'bg-sky-50 text-sky-700 border-sky-200',
  Vacation: 'bg-blue-50 text-blue-700 border-blue-200',
  Exam: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Work: 'bg-slate-100 text-slate-700 border-slate-200',
  Celebration: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  Personal: 'bg-teal-50 text-teal-700 border-teal-200',
  General: 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function EventCard({ event, onEdit, onDelete }) {
  const { title, target_date, created_at, category = 'General', description } = event;
  const currentStatus = getRemainingTime(target_date, created_at);
  const badgeClass = CATEGORY_COLORS[category] || CATEGORY_COLORS.General;

  return (
    <div className="glass-card glass-card-hover flex flex-col justify-between p-5 relative overflow-hidden group">
      {/* Top Category Badge & Actions */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${badgeClass}`}>
          <Tag className="w-3 h-3" />
          {category}
        </span>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(event)}
            title="Edit Event"
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(event)}
            title="Delete Event"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title & Description */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Live Countdown Display */}
      <div className="my-2">
        <CountdownTimer targetDate={target_date} createdAt={created_at} />
      </div>

      {/* Target Date Details & Footer Progress */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="font-medium text-slate-600 truncate">{formatDisplayDate(target_date)}</span>
        </div>

        {!currentStatus.isExpired && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono font-medium">
            <Clock className="w-3 h-3 text-blue-500" />
            <span>{currentStatus.percentElapsed}% passed</span>
          </div>
        )}
      </div>

      {/* Progress Bar along bottom of card */}
      {!currentStatus.isExpired && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
          <div
            className="h-full bg-blue-600 transition-all duration-1000"
            style={{ width: `${currentStatus.percentElapsed}%` }}
          />
        </div>
      )}
    </div>
  );
}
