import { motion } from 'framer-motion';
import { Leaderboard } from '../components/Leaderboard';
import { PuzzleArena } from '../components/PuzzleArena';
import { EventHighlights } from '../components/EventHighlights';
import { UpcomingEvents } from '../components/UpcomingEvents';
import type { Team } from '../data/mockData';

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

interface HomeProps {
  teams: Team[];
}

export function Home({ teams }: HomeProps) {
  return (
    <motion.div
      key="home"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
      className="space-y-24"
    >
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Animated background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
            style={{ background: '#7A5CFF' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-10"
            style={{ background: '#00E5FF' }}
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.05, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/2 w-64 h-64 rounded-full blur-3xl opacity-8"
            style={{ background: '#FF2E88' }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.06, 0.12, 0.06] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(122,92,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(122,92,255,1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
          style={{
            background: 'rgba(122, 92, 255, 0.15)',
            border: '1px solid rgba(122, 92, 255, 0.4)',
            color: '#7A5CFF',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: '#7A5CFF' }}
          />
          Season 2 · Now Live
        </motion.div>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative z-10 text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tighter mb-4"
          style={{ fontFamily: 'Orbitron, sans-serif' }}
        >
          <span
            style={{
              background: 'linear-gradient(135deg, #00E5FF 0%, #7A5CFF 50%, #FF2E88 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 0 30px rgba(0, 229, 255, 0.3))',
            }}
          >
            TFT2
          </span>
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #7A5CFF 0%, #FF2E88 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            ARENA
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative z-10 text-lg md:text-xl text-white/50 font-light tracking-widest uppercase mb-10"
        >
          The Ultimate Studio Challenge
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="relative z-10 flex flex-wrap gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="btn-neon px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider text-white cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #7A5CFF, #00E5FF)',
              boxShadow: '0 0 30px #7A5CFF44',
            }}
          >
            View Leaderboard ↓
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="btn-neon px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer"
            style={{
              background: 'transparent',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              color: '#00E5FF',
            }}
          >
            Try Puzzle →
          </motion.button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/20" />
          <div className="w-1 h-1 rounded-full bg-white/20" />
        </motion.div>
      </section>

      {/* Leaderboard */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 w-full">
        <Leaderboard teams={teams} />
      </section>

      {/* Puzzle Arena */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 w-full">
        <PuzzleArena />
      </section>

      {/* Event Highlights */}
      <section className="px-4 sm:px-6 xl:px-12">
        <EventHighlights />
      </section>

      {/* Upcoming Events */}
      <section className="px-4 sm:px-6 xl:px-12">
        <UpcomingEvents />
      </section>
    </motion.div>
  );
}
