import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonCard } from '../components/NeonCard';
import { EventManager } from '../components/EventManager';
import type { Team, Announcement, Event, Puzzle, ManagedEvent } from '../data/mockData';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info';
}

let toastId = 0;

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (message: string, type: Toast['type'] = 'success') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };
  return { toasts, addToast };
}

interface AdminDashboardProps {
  teams: Team[];
  announcements: Announcement[];
  upcomingEvents: Event[];
  activePuzzle: Puzzle;
  managedEvents: ManagedEvent[];
  onTeamsUpdate: (teams: Team[]) => void;
  onAddEvent: (event: Event) => void;
  onPostAnnouncement: (announcement: Announcement) => void;
  onLaunchPuzzle: (puzzle: Puzzle) => void;
  onManagedEventsUpdate: (events: ManagedEvent[]) => void;
}

export function AdminDashboard({
  teams,
  announcements,
  upcomingEvents,
  activePuzzle,
  managedEvents,
  onTeamsUpdate,
  onAddEvent,
  onPostAnnouncement,
  onLaunchPuzzle,
  onManagedEventsUpdate,
}: AdminDashboardProps) {
  const { toasts, addToast } = useToast();

  // Add Event state
  const [eventForm, setEventForm] = useState({ title: '', category: '', date: '', description: '' });
  const [eventSubmitted, setEventSubmitted] = useState(false);

  // Post Announcement state
  const [announcement, setAnnouncement] = useState('');
  const [announcementSubmitted, setAnnouncementSubmitted] = useState(false);

  // Launch Puzzle state
  const [puzzleForm, setPuzzleForm] = useState({ question: '', answer: '', points: '50' });
  const [puzzleSubmitted, setPuzzleSubmitted] = useState(false);

  // Update Score state
  const [scoreForm, setScoreForm] = useState({ teamId: '', points: '' });
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setEventSubmitted(true);
    if (!eventForm.title.trim()) return;
    const newEvent: Event = {
      id: `evt-${Date.now()}`,
      title: eventForm.title.trim(),
      category: eventForm.category.trim() || 'General',
      date: eventForm.date
        ? new Date(eventForm.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'TBD',
      description: eventForm.description.trim() || 'No description provided.',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=225&fit=crop',
      status: 'upcoming',
    };
    onAddEvent(newEvent);
    addToast(`✅ Event "${newEvent.title}" added to schedule`);
    setEventForm({ title: '', category: '', date: '', description: '' });
    setEventSubmitted(false);
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    setAnnouncementSubmitted(true);
    if (!announcement.trim()) return;
    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      emoji: '📢',
      text: announcement.trim(),
    };
    onPostAnnouncement(newAnnouncement);
    addToast(`📢 Announcement posted: "${announcement.slice(0, 40)}${announcement.length > 40 ? '...' : ''}"`);
    setAnnouncement('');
    setAnnouncementSubmitted(false);
  };

  const handleLaunchPuzzle = (e: React.FormEvent) => {
    e.preventDefault();
    setPuzzleSubmitted(true);
    if (!puzzleForm.question.trim() || !puzzleForm.answer.trim()) return;
    const pts = Math.max(10, Math.min(200, parseInt(puzzleForm.points, 10) || 50));
    const newPuzzle: Puzzle = {
      id: `pzl-${Date.now()}`,
      question: puzzleForm.question.trim(),
      hint: 'Think carefully...',
      answer: puzzleForm.answer.trim(),
      points: pts,
      isActive: true,
    };
    onLaunchPuzzle(newPuzzle);
    addToast(`🧩 Puzzle launched! (${pts} pts)`);
    setPuzzleForm({ question: '', answer: '', points: '50' });
    setPuzzleSubmitted(false);
  };

  const handleUpdateScore = (e: React.FormEvent) => {
    e.preventDefault();
    setScoreSubmitted(true);
    const team = teams.find((t) => t.id === scoreForm.teamId);
    if (!team || !scoreForm.points) return;
    const delta = parseInt(scoreForm.points, 10);
    if (isNaN(delta)) return;
    const updated = teams.map((t) =>
      t.id === scoreForm.teamId ? { ...t, score: Math.max(0, t.score + delta) } : t,
    );
    onTeamsUpdate(updated);
    addToast(`⚡ ${team.name} score ${delta >= 0 ? '+' : ''}${delta} → ${Math.max(0, team.score + delta)} pts`);
    setScoreForm({ teamId: '', points: '' });
    setScoreSubmitted(false);
  };

  const inputCls = 'cyber-input w-full px-4 py-3 rounded-xl text-sm';
  const labelCls = 'block text-xs uppercase tracking-wider text-white/40 mb-1.5 font-medium';
  const errorCls = 'text-xs text-[#F87171] mt-1.5 flex items-center gap-1';

  const errorInput = (base: string) =>
    `${base} border-[#F87171] focus:border-[#F87171]`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)' }}
        >
          🔑
        </div>
        <div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Admin Control Room</h1>
          <p className="text-sm text-white/40 mt-0.5">Manage events, puzzles, scores, and announcements</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Teams', value: teams.length, icon: '🛡️', color: '#38BDF8' },
          { label: 'Upcoming Events', value: upcomingEvents.length, icon: '🗓️', color: '#94A3B8' },
          { label: 'Active Puzzle', value: activePuzzle.points, icon: '🧩', color: '#34D399' },
          { label: 'Announcements', value: announcements.length, icon: '📢', color: '#F59E0B' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4"
            style={{
              background: '#131A27',
              border: `1px solid ${stat.color}22`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span>{stat.icon}</span>
              <span className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</span>
            </div>
            <div
              className="text-2xl font-black"
              style={{ color: stat.color, fontFamily: '"Space Grotesk", sans-serif' }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Control panels grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Event */}
        <NeonCard variant="blue" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🗓️</span>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Add Event</h3>
          </div>
          <form onSubmit={handleAddEvent} className="space-y-3">
            <div>
              <label className={labelCls}>Event Title <span className="text-[#F87171]">*</span></label>
              <input
                className={eventSubmitted && !eventForm.title.trim() ? errorInput(inputCls) : inputCls}
                placeholder="e.g. Decathlon Sprint"
                value={eventForm.title}
                onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
              />
              {eventSubmitted && !eventForm.title.trim() && (
                <p className={errorCls}><span>⚠</span> Event title is required</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Category</label>
                <input
                  className={inputCls}
                  placeholder="e.g. Physical"
                  value={eventForm.category}
                  onChange={(e) => setEventForm((f) => ({ ...f, category: e.target.value }))}
                />
              </div>
              <div>
                <label className={labelCls}>Date</label>
                <input
                  type="date"
                  className={inputCls}
                  value={eventForm.date}
                  onChange={(e) => setEventForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={2}
                placeholder="Brief description..."
                value={eventForm.description}
                onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <AdminButton color="#38BDF8">Add to Schedule →</AdminButton>
          </form>
        </NeonCard>

        {/* Post Announcement */}
        <NeonCard variant="pink" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📢</span>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Post Announcement</h3>
          </div>
          <form onSubmit={handlePostAnnouncement} className="space-y-3">
            <div>
              <label className={labelCls}>Announcement Text <span className="text-[#F87171]">*</span></label>
              <textarea
                className={`${announcementSubmitted && !announcement.trim() ? errorInput(inputCls) : inputCls} resize-none`}
                rows={4}
                placeholder="Type your announcement here... (will appear in the ticker)"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
              />
              {announcementSubmitted && !announcement.trim() && (
                <p className={errorCls}><span>⚠</span> Announcement text is required</p>
              )}
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[rgba(56,189,248,0.06)] border border-[rgba(56,189,248,0.15)]">
              <span className="text-xs">💡</span>
              <span className="text-xs text-white/40">Announcement will appear immediately in the ticker</span>
            </div>
            <AdminButton color="#F59E0B">Post Now →</AdminButton>
          </form>
        </NeonCard>

        {/* Launch Puzzle */}
        <NeonCard variant="purple" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🧩</span>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Launch Puzzle</h3>
          </div>
          <form onSubmit={handleLaunchPuzzle} className="space-y-3">
            <div>
              <label className={labelCls}>Puzzle Question <span className="text-[#F87171]">*</span></label>
              <textarea
                className={`${puzzleSubmitted && !puzzleForm.question.trim() ? errorInput(inputCls) : inputCls} resize-none`}
                rows={3}
                placeholder="Enter your riddle or puzzle question..."
                value={puzzleForm.question}
                onChange={(e) => setPuzzleForm((f) => ({ ...f, question: e.target.value }))}
              />
              {puzzleSubmitted && !puzzleForm.question.trim() && (
                <p className={errorCls}><span>⚠</span> Question is required</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Answer <span className="text-[#F87171]">*</span></label>
                <input
                  className={puzzleSubmitted && !puzzleForm.answer.trim() ? errorInput(inputCls) : inputCls}
                  placeholder="Correct answer"
                  value={puzzleForm.answer}
                  onChange={(e) => setPuzzleForm((f) => ({ ...f, answer: e.target.value }))}
                />
                {puzzleSubmitted && !puzzleForm.answer.trim() && (
                  <p className={errorCls}><span>⚠</span> Required</p>
                )}
              </div>
              <div>
                <label className={labelCls}>Points</label>
                <input
                  type="number"
                  className={inputCls}
                  placeholder="50"
                  min="10"
                  max="200"
                  value={puzzleForm.points}
                  onChange={(e) => setPuzzleForm((f) => ({ ...f, points: e.target.value }))}
                />
              </div>
            </div>
            <AdminButton color="#38BDF8">Launch Puzzle →</AdminButton>
          </form>
        </NeonCard>

        {/* Update Score */}
        <NeonCard variant="green" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚡</span>
            <h3 className="font-bold text-white text-sm uppercase tracking-wider" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Update Team Score</h3>
          </div>
          <form onSubmit={handleUpdateScore} className="space-y-3">
            <div>
              <label className={labelCls}>Select Team <span className="text-[#F87171]">*</span></label>
              <select
                className={`${scoreSubmitted && !scoreForm.teamId ? errorInput(inputCls) : inputCls} appearance-none`}
                value={scoreForm.teamId}
                onChange={(e) => setScoreForm((f) => ({ ...f, teamId: e.target.value }))}
              >
                <option value="">Choose a team...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.logo} {t.name} — {t.score} pts
                  </option>
                ))}
              </select>
              {scoreSubmitted && !scoreForm.teamId && (
                <p className={errorCls}><span>⚠</span> Please select a team</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Points Delta (+ to add, - to subtract) <span className="text-[#F87171]">*</span></label>
              <input
                type="number"
                className={scoreSubmitted && !scoreForm.points ? errorInput(inputCls) : inputCls}
                placeholder="e.g. +50 or -10"
                value={scoreForm.points}
                onChange={(e) => setScoreForm((f) => ({ ...f, points: e.target.value }))}
              />
              {scoreSubmitted && !scoreForm.points && (
                <p className={errorCls}><span>⚠</span> Points value is required</p>
              )}
            </div>
            {/* Live preview */}
            {scoreForm.teamId && scoreForm.points && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.20)]"
              >
                <span className="text-xs text-white/40">Preview:</span>
                <span className="text-xs font-bold text-[#34D399]">
                  {teams.find((t) => t.id === scoreForm.teamId)?.score ?? 0} →{' '}
                  {Math.max(
                    0,
                    (teams.find((t) => t.id === scoreForm.teamId)?.score ?? 0) +
                      (parseInt(scoreForm.points, 10) || 0),
                  )}{' '}
                  pts
                </span>
              </motion.div>
            )}
            <AdminButton color="#34D399">Update Score →</AdminButton>
          </form>
        </NeonCard>
      </div>

      {/* Divider */}
      <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.2), transparent)' }} />

      {/* Event Manager */}
      <EventManager events={managedEvents} onEventsUpdate={onManagedEventsUpdate} />

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 space-y-2 z-50 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
              className="px-5 py-3.5 rounded-xl text-sm font-medium text-white max-w-sm pointer-events-auto"
              style={{
                background: 'rgba(13,17,23,0.95)',
                border: '1px solid rgba(56,189,248,0.25)',
                boxShadow: '0 8px 32px #00000066, 0 0 20px rgba(56,189,248,0.08)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AdminButton({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <motion.button
      type="submit"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="btn-neon w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-white cursor-pointer"
      style={{
        background: `linear-gradient(135deg, ${color}33, ${color}11)`,
        border: `1px solid ${color}44`,
        color,
      }}
    >
      {children}
    </motion.button>
  );
}
