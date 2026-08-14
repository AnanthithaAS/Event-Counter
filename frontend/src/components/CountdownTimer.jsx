import React from 'react';
import confetti from 'canvas-confetti';
import { useCountdown } from '../hooks/useCountdown';
import { padZero } from '../utils/countdown';
import { Sparkles } from 'lucide-react';

export default function CountdownTimer({ targetDate, createdAt, onExpire }) {
  const timeLeft = useCountdown(targetDate, createdAt, () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        colors: ['#2563eb', '#3b82f6', '#60a5fa', '#1d4ed8', '#93c5fd'],
        origin: { y: 0.7 },
      });
    } catch {
      // safe fallback
    }
    if (typeof onExpire === 'function') onExpire();
  });

  const { days, hours, minutes, seconds, isExpired } = timeLeft;

  if (isExpired) {
    return (
      <div className="py-3 px-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-emerald-700 font-semibold shadow-xs">
        <Sparkles className="w-4 h-4 text-emerald-600 animate-bounce" />
        <span className="text-sm tracking-wide">🎉 Event Started!</span>
      </div>
    );
  }

  const timeUnits = [
    { label: 'DAYS', value: padZero(days) },
    { label: 'HOURS', value: padZero(hours) },
    { label: 'MINUTES', value: padZero(minutes) },
    { label: 'SECONDS', value: padZero(seconds) },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-2 text-center">
        {timeUnits.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center justify-center py-2.5 px-1 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs hover:border-blue-300 transition-colors"
          >
            <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-blue-600">
              {unit.value}
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-500 mt-0.5 font-mono">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
