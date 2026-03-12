import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonCard } from '../components/NeonCard';
import type { Team, Announcement, Event, Puzzle } from '../data/mockData';

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
  onTeamsUpdate: (teams: Team[]) => void;
  onAddEvent: (event: Event) => void;
  onPostAnnouncement: (announcement: Announcement) => void;
  onLaunchPuzzle: (puzzle: Puzzle) => void;
}

export function AdminDashboard({
  teams,
  announcements,
  upcomingEvents,
  activePuzzle,
  onTeamsUpdate,
  onAddEvent,
  onPostAnnouncement,
  onLaunchPuzzle,
}: AdminDashboardProps) {
  const { toasts, addToast } = useToast();

  // Add Event state
  const [eventForm, setEventForm] = useState({ title: '', category: '', date: '', description: '' });

  // Post Announcement state
  const [announcement, setAnnouncement] = useState('');

  // Launch Puzzle state
  const [puzzleForm, setPuzzleForm] = useState({ question: '', answer: '', points: '50' });

  // Update Score state
  const [scoreForm, setScoreForm] = useState({ teamId: '', points: '' });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement.trim()) return;
    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      emoji: '📢',
      text: announcement.trim(),
    };
    onPostAnnouncement(newAnnouncement);
    addToast(`📢 Announcement posted: "${announcement.slice(0, 40)}${announcement.length > 40 ? '...' : ''}"`);
    setAnnouncement('');
  };

  const handleLaunchPuzzle = (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  const handleUpdateScore = (e: React.FormEvent) => {
    e.preventDefault();
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
  };

  const inputCls = 'cyber-input w-full px-4 py-3 rounded-xl text-sm';
  const labelCls = 'block text-xs uppercase tracking-wider text-white/40 mb-1.5 font-medium';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: 'linear-gradient(135deg, #FF2E8822, #7A5CFF22)', border: '1px solid #FF2E8844' }}
        >
          🔑
        </div>
        <div>
          <h1 className="text-2xl font-black text-white font-[Orbitron]">Admin Control Room</h1>
          <p className="text-sm text-white/40 mt-0.5">Manage events, puzzles, scores, and announcements</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Teams', value: teams.length, icon: '🛡️', color: '#00E5FF' },
          { label: 'Upcoming Events', value: upcomingEvents.length, icon: '🗓️', color: '#7A5CFF' },
          { label: 'Active Puzzle', value: activePuzzle.points, icon: '🧩', color: '#00FFC6' },
          { label: 'Announcements', value: announcements.length, icon: '📢', color: '#FF2E88' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-4"
            style={{
              background: 'rgba(15, 15, 26, 0.7)',
              border: `1px solid ${stat.color}22`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span>{stat.icon}</span>
              <span className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</span>
            </div>
            <div
              className="text-2xl font-black font-[Orbitron]"
              style={{ color: stat.color, textShadow: `0 0 15px ${stat.color}66` }}
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
            <h3 className="font-bold text-white font-[Orbitron] text-sm uppercase tracking-wider">Add Event</h3>
          </div>
          <form onSubmit={handleAddEvent} className="space-y-3">
            <div>
              <label className={labelCls}>Event Title</label>
              <input
                className={inputCls}
                placeholder="e.g. Decathlon Sprint"
                value={eventForm.title}
                onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
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
            <AdminButton color="#00E5FF">Add to Schedule →</AdminButton>
          </form>
        </NeonCard>

        {/* Post Announcement */}
        <NeonCard variant="pink" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📢</span>
            <h3 className="font-bold text-white font-[Orbitron] text-sm uppercase tracking-wider">Post Announcement</h3>
          </div>
          <form onSubmit={handlePostAnnouncement} className="space-y-3">
            <div>
              <label className={labelCls}>Announcement Text</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                placeholder="Type your announcement here... (will appear in the ticker)"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#FF2E8811] border border-[#FF2E8822]">
              <span className="text-xs">💡</span>
              <span className="text-xs text-white/40">Announcement will appear immediately in the ticker</span>
            </div>
            <AdminButton color="#FF2E88">Post Now →</AdminButton>
          </form>
        </NeonCard>

        {/* Launch Puzzle */}
        <NeonCard variant="purple" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🧩</span>
            <h3 className="font-bold text-white font-[Orbitron] text-sm uppercase tracking-wider">Launch Puzzle</h3>
          </div>
          <form onSubmit={handleLaunchPuzzle} className="space-y-3">
            <div>
              <label className={labelCls}>Puzzle Question</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Enter your riddle or puzzle question..."
                value={puzzleForm.question}
                onChange={(e) => setPuzzleForm((f) => ({ ...f, question: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Answer</label>
                <input
                  className={inputCls}
                  placeholder="Correct answer"
                  value={puzzleForm.answer}
                  onChange={(e) => setPuzzleForm((f) => ({ ...f, answer: e.target.value }))}
                  required
                />
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
            <AdminButton color="#7A5CFF">Launch Puzzle →</AdminButton>
          </form>
        </NeonCard>

        {/* Update Score */}
        <NeonCard variant="green" className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚡</span>
            <h3 className="font-bold text-white font-[Orbitron] text-sm uppercase tracking-wider">Update Team Score</h3>
          </div>
          <form onSubmit={handleUpdateScore} className="space-y-3">
            <div>
              <label className={labelCls}>Select Team</label>
              <select
                className={`${inputCls} appearance-none`}
                value={scoreForm.teamId}
                onChange={(e) => setScoreForm((f) => ({ ...f, teamId: e.target.value }))}
                required
              >
                <option value="">Choose a team...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.logo} {t.name} — {t.score} pts
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Points Delta (+ to add, - to subtract)</label>
              <input
                type="number"
                className={inputCls}
                placeholder="e.g. +50 or -10"
                value={scoreForm.points}
                onChange={(e) => setScoreForm((f) => ({ ...f, points: e.target.value }))}
                required
              />
            </div>
            {/* Live preview */}
            {scoreForm.teamId && scoreForm.points && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#00FFC611] border border-[#00FFC622]"
              >
                <span className="text-xs text-white/40">Preview:</span>
                <span className="text-xs font-bold text-[#00FFC6]">
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
            <AdminButton color="#00FFC6">Update Score →</AdminButton>
          </form>
        </NeonCard>
      </div>

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
                background: 'rgba(15, 15, 26, 0.95)',
                border: '1px solid #00FFC644',
                boxShadow: '0 8px 32px #00000066, 0 0 20px #00FFC622',
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
