import React from 'react';
import { Link } from 'react-router-dom';
import { Timer, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6 shadow-xs">
        <Timer className="w-7 h-7" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <p className="text-lg text-slate-700 font-semibold mt-2">Page Not Found</p>
      <p className="text-sm text-slate-500 mt-1 max-w-sm">
        The countdown or page you are looking for doesn't exist or has moved.
      </p>
      <div className="mt-6">
        <Link to="/" className="btn-primary py-2.5 px-6 gap-2 inline-flex items-center text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
