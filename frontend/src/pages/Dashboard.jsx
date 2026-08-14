import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Navbar from '../components/Navbar';
import StatSummary from '../components/StatSummary';
import EventCard from '../components/EventCard';
import EventModal from '../components/EventModal';
import DeleteModal from '../components/DeleteModal';
import { eventApi } from '../api/eventApi';
import { getRemainingTime } from '../utils/countdown';
import { 
  Plus, 
  Search, 
  SortAsc, 
  Timer, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('active'); // 'all', 'active', 'expired'
  const [sortBy, setSortBy] = useState('nearest'); // 'nearest', 'furthest', 'created'

  // Modal States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchEvents = useCallback(async () => {
    try {
      setErrorMessage('');
      const data = await eventApi.getEvents();
      setEvents(data);
    } catch {
      setErrorMessage('Failed to load your countdown events. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle Event Create & Edit Submit
  const handleSaveEvent = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingEvent) {
        const updated = await eventApi.updateEvent(editingEvent.id, formData);
        setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
        showToast(`"${updated.title}" updated successfully!`);
      } else {
        const created = await eventApi.createEvent(formData);
        setEvents((prev) => [...prev, created]);
        showToast(`"${created.title}" countdown created!`);
      }
      setIsEventModalOpen(false);
      setEditingEvent(null);
    } catch (err) {
      const errDetail = err.response?.data?.title?.[0] || err.response?.data?.target_date?.[0] || 'Error saving event.';
      alert(`Error: ${errDetail}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Event Delete
  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;
    try {
      setIsDeleting(true);
      await eventApi.deleteEvent(deletingEvent.id);
      setEvents((prev) => prev.filter((e) => e.id !== deletingEvent.id));
      showToast(`Event deleted successfully.`);
      setIsDeleteModalOpen(false);
      setDeletingEvent(null);
    } catch {
      alert('Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEdit = (event) => {
    setEditingEvent(event);
    setIsEventModalOpen(true);
  };

  const handleOpenDelete = (event) => {
    setDeletingEvent(event);
    setIsDeleteModalOpen(true);
  };

  // Filtered and Sorted Events
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Filter by status
    if (statusFilter === 'active') {
      result = result.filter((e) => !getRemainingTime(e.target_date).isExpired);
    } else if (statusFilter === 'expired') {
      result = result.filter((e) => getRemainingTime(e.target_date).isExpired);
    }

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter((e) => e.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) => e.title.toLowerCase().includes(q) || (e.description && e.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      const timeA = new Date(a.target_date).getTime();
      const timeB = new Date(b.target_date).getTime();

      if (sortBy === 'nearest') {
        return timeA - timeB;
      } else if (sortBy === 'furthest') {
        return timeB - timeA;
      } else if (sortBy === 'created') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });

    return result;
  }, [events, statusFilter, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onOpenCreateModal={() => { setEditingEvent(null); setIsEventModalOpen(true); }} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-slate-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Summary Ribbon */}
        <StatSummary events={events} />

        {/* Control Bar: Search, Filters & Action Button */}
        <div className="glass-card p-4 sm:p-5 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-events-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search countdowns by title or notes..."
                className="glass-input w-full pl-10 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600 absolute right-3.5 top-1/2 -translate-y-1/2 font-mono"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Status Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  statusFilter === 'active'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active Timers
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  statusFilter === 'all'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setStatusFilter('expired')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  statusFilter === 'expired'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Started 🎉
              </button>
            </div>
          </div>

          {/* Secondary Filter Row: Category pills & Sort Select */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {/* Category Select */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
              {['All', 'Birthday', 'Vacation', 'Exam', 'Work', 'Celebration', 'Personal'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 border border-slate-200/60'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs text-slate-500 ml-auto">
              <SortAsc className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold text-slate-600">Sort:</span>
              <select
                id="sort-events-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-300 text-slate-700 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-blue-500"
              >
                <option value="nearest">Nearest Target Date</option>
                <option value="furthest">Furthest Target Date</option>
                <option value="created">Recently Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-700 text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={fetchEvents} className="btn-secondary text-xs py-1 px-3">
              Retry
            </button>
          </div>
        )}

        {/* Content Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 h-56 animate-pulse flex flex-col justify-between">
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-4" />
                <div className="h-16 bg-slate-100 rounded-xl my-2" />
                <div className="h-4 bg-slate-200 rounded w-2/3 mt-4" />
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          /* Empty State */
          <div className="glass-card p-12 text-center max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-4">
              <Timer className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {events.length === 0
                ? 'No Countdown Events Yet'
                : 'No Matching Events Found'}
            </h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
              {events.length === 0
                ? 'Create your first countdown timer to monitor birthdays, upcoming trips, exams, or major milestones.'
                : 'Try adjusting your search query, status filter, or category pills.'}
            </p>
            <div className="mt-6">
              <button
                id="empty-create-event-btn"
                onClick={() => {
                  setEditingEvent(null);
                  setIsEventModalOpen(true);
                }}
                className="btn-primary py-2.5 px-6 gap-2 inline-flex items-center text-sm font-semibold"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Your First Event</span>
              </button>
            </div>
          </div>
        ) : (
          /* Events Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-16 text-center text-xs text-slate-500">
        <p>ChronoCount — Real-Time Event Countdown Timer App</p>
      </footer>

      {/* Modals */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        initialData={editingEvent}
        isSubmitting={isSubmitting}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingEvent(null);
        }}
        onConfirm={handleConfirmDelete}
        eventTitle={deletingEvent?.title || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
}
