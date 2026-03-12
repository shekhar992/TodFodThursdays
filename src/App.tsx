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
    <div className="min-h-screen" style={{ background: '#0D1117' }}>
      {/* Admin mode top indicator */}
      {role === 'admin' && (
        <div
          className="fixed top-0 left-0 right-0 z-50 h-0.5"
          style={{ background: 'linear-gradient(90deg, transparent, #F59E0B, #F59E0B, transparent)' }}
        />
      )}

      {/* Announcement Ticker */}
      <AnnouncementTicker announcements={announcements} />

      {/* Header / Nav */}
      <header
        className="sticky top-0 z-40 h-14"
        style={{
          background: role === 'admin'
            ? 'rgba(13, 17, 23, 0.95)'
            : 'rgba(13, 17, 23, 0.92)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: role === 'admin'
            ? '1px solid rgba(245, 158, 11, 0.18)'
            : '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div className="max-w-screen-xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-black"
              style={{
                background: 'rgba(56,189,248,0.15)',
                border: '1px solid rgba(56,189,248,0.3)',
                color: '#38BDF8',
              }}
            >
              ⚡
            </div>
            <span
              className="text-sm font-bold tracking-tight hidden sm:block text-[#EEF2F7]"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              TFT2 Arena
            </span>
            {role === 'admin' && (
              <span
                className="text-xs px-2 py-0.5 rounded font-semibold"
                style={{
                  background: 'rgba(245,158,11,0.12)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  color: '#F59E0B',
                }}
              >
                Admin
              </span>
            )}
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              { label: 'Dashboard', active: role === 'player' },
              { label: 'Events' },
              { label: 'Puzzles' },
            ].map((link) => (
              <button
                key={link.label}
                className="text-xs font-medium cursor-pointer transition-colors duration-200 uppercase tracking-wider"
                style={{ color: link.active ? '#38BDF8' : 'rgba(238,242,247,0.3)' }}
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
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.20)',
                  color: '#F59E0B',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                  style={{ backgroundColor: '#F59E0B' }}
                />
                Admin Mode — Changes update the player view in real time
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
              announcements={announcements}
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
            className="text-sm font-semibold"
            style={{ fontFamily: '"Space Grotesk", sans-serif', color: 'rgba(238,242,247,0.15)' }}
          >
            TFT2 Arena
          </span>
          <span className="text-xs" style={{ color: 'rgba(238,242,247,0.15)' }}>
            Season 2 · Deloitte Studio Competition · {new Date().getFullYear()}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{
              background: 'rgba(56,189,248,0.08)',
              border: '1px solid rgba(56,189,248,0.15)',
              color: 'rgba(56,189,248,0.5)',
            }}
          >
            Live
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
