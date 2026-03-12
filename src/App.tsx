import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DevRoleSwitcher, type Role } from './components/DevRoleSwitcher';
import { AnnouncementTicker } from './components/AnnouncementTicker';
import { Home } from './pages/Home';
import { AdminDashboard } from './pages/AdminDashboard';
import {
  mockTeams,
  mockAnnouncements,
  mockHighlightEvents,
  mockUpcomingEvents,
  mockActivePuzzle,
  mockManagedEvents,
  type Team,
  type Announcement,
  type Event,
  type Puzzle,
  type ManagedEvent,
} from './data/mockData';

function App() {
  const [role, setRole] = useState<Role>('player');
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [highlightEvents] = useState<Event[]>(mockHighlightEvents);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>(mockUpcomingEvents);
  const [activePuzzle, setActivePuzzle] = useState<Puzzle>(mockActivePuzzle);
  const [managedEvents, setManagedEvents] = useState<ManagedEvent[]>(mockManagedEvents);

  const handleAddEvent = (event: Event) => {
    setUpcomingEvents((prev) => [event, ...prev]);
  };

  const handlePostAnnouncement = (announcement: Announcement) => {
    setAnnouncements((prev) => [announcement, ...prev]);
  };

  const handleLaunchPuzzle = (puzzle: Puzzle) => {
    setActivePuzzle(puzzle);
  };

  return (
    <div className="min-h-screen scanline-overlay noise-texture animated-gradient">
      {/* Admin mode top bar */}
      {role === 'admin' && (
        <div
          className="fixed top-0 left-0 right-0 z-50 h-0.5"
          style={{ background: 'linear-gradient(90deg, #FF2E88, #7A5CFF, #FF2E88)' }}
        />
      )}

      {/* Announcement Ticker */}
      <AnnouncementTicker announcements={announcements} />

      {/* Header / Nav */}
      <header
        className="sticky top-0 z-40 h-16"
        style={{
          background: role === 'admin'
            ? 'rgba(45, 18, 65, 0.94)'
            : 'rgba(35, 22, 110, 0.90)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: role === 'admin'
            ? '1px solid rgba(255, 46, 136, 0.2)'
            : '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="max-w-screen-xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
              style={{
                background: 'linear-gradient(135deg, #7A5CFF, #00E5FF)',
                boxShadow: '0 0 15px #7A5CFF44',
              }}
            >
              ⚡
            </div>
            <span
              className="text-base font-black tracking-tight hidden sm:block"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                background: 'linear-gradient(135deg, #00E5FF, #7A5CFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              TFT2 ARENA
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: 'Home', active: role === 'player' },
              { label: 'Leaderboard' },
              { label: 'Events' },
              { label: 'Puzzles' },
            ].map((link) => (
              <button
                key={link.label}
                className="text-sm font-medium cursor-pointer transition-colors duration-200"
                style={{ color: link.active ? '#00E5FF' : 'rgba(255,255,255,0.4)' }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Role switcher */}
          <DevRoleSwitcher role={role} onRoleChange={setRole} />
        </div>
      </header>

      {/* Page content */}
      <main className="max-w-screen-xl mx-auto pb-24">
        <AnimatePresence mode="wait">
          {role === 'admin' ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="px-4 sm:px-6 xl:px-12 pt-10"
            >
              {/* Admin mode banner */}
              <div
                className="mb-8 flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,46,136,0.1), rgba(122,92,255,0.1))',
                  border: '1px solid rgba(255,46,136,0.25)',
                  color: '#FF2E88',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                  style={{ backgroundColor: '#FF2E88' }}
                />
                Admin Mode Active — Changes update the player view in real time
              </div>
              <AdminDashboard
                teams={teams}
                announcements={announcements}
                upcomingEvents={upcomingEvents}
                activePuzzle={activePuzzle}
                managedEvents={managedEvents}
                onTeamsUpdate={setTeams}
                onAddEvent={handleAddEvent}
                onPostAnnouncement={handlePostAnnouncement}
                onLaunchPuzzle={handleLaunchPuzzle}
                onManagedEventsUpdate={setManagedEvents}
              />
            </motion.div>
          ) : (
            <Home
              key="home"
              teams={teams}
              highlightEvents={highlightEvents}
              upcomingEvents={upcomingEvents}
              activePuzzle={activePuzzle}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer
        className="border-t py-8 px-6"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span
            className="text-sm font-bold tracking-wider"
            style={{ fontFamily: 'Orbitron, sans-serif', color: 'rgba(255,255,255,0.15)' }}
          >
            TFT2 ARENA
          </span>
          <span className="text-xs text-white/20">
            Season 2 · Deloitte Studio Competition · {new Date().getFullYear()}
          </span>
          <div className="flex items-center gap-4">
            {['#00E5FF', '#7A5CFF', '#FF2E88', '#00FFC6'].map((c) => (
              <div
                key={c}
                className="w-2 h-2 rounded-full opacity-40"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
