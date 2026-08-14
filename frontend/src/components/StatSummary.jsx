import React from 'react';
import { Timer, CheckCircle2, Clock, CalendarDays } from 'lucide-react';
import { getRemainingTime } from '../utils/countdown';

export default function StatSummary({ events = [] }) {
  const total = events.length;
  const activeEvents = events.filter((e) => !getRemainingTime(e.target_date).isExpired);
  const completedEvents = events.filter((e) => getRemainingTime(e.target_date).isExpired);

  const nearestEvent = activeEvents.length > 0 ? activeEvents[0] : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Events */}
      <div className="glass-card p-4 flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
          <CalendarDays className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Total Events</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{total}</p>
        </div>
      </div>

      {/* Active Countdowns */}
      <div className="glass-card p-4 flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
          <Timer className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Active Timers</p>
          <p className="text-2xl font-bold text-blue-600 mt-0.5">{activeEvents.length}</p>
        </div>
      </div>

      {/* Nearest Milestone */}
      <div className="glass-card p-4 flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
          <Clock className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Next Upcoming</p>
          <p className="text-sm font-semibold text-slate-800 truncate mt-0.5" title={nearestEvent?.title || 'None'}>
            {nearestEvent ? nearestEvent.title : 'No upcoming events'}
          </p>
        </div>
      </div>

      {/* Completed */}
      <div className="glass-card p-4 flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-emerald-600 mt-0.5">{completedEvents.length}</p>
        </div>
      </div>
    </div>
  );
}
