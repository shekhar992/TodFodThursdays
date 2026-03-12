import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Puzzle } from '../data/mockData';

const CONFETTI_COLORS = ['#38BDF8', '#34D399', '#F8C03B', '#F59E0B', '#EEF2F7', '#A5F3FC'];

function ConfettiPiece({ color, index }: { color: string; index: number }) {
  const x = Math.random() * 600 - 300;
  const rotate = Math.random() * 720 - 360;
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 w-2 h-2 rounded-sm pointer-events-none"
      style={{ backgroundColor: color, originX: '50%', originY: '50%' }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
      animate={{
        x,
        y: Math.random() * -400 - 100,
        opacity: [1, 1, 0],
        scale: [0, 1, 0.5],
        rotate,
      }}
      transition={{ duration: 1.5, delay: index * 0.02, ease: 'easeOut' }}
    />
  );
}

interface PuzzleArenaProps {
  puzzle: Puzzle;
}

export function PuzzleArena({ puzzle }: PuzzleArenaProps) {
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'wrong'>('idle');
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim().toLowerCase() === puzzle.answer.toLowerCase()) {
      setStatus('success');
    } else {
      setStatus('wrong');
      setAttempts((a) => a + 1);
      setTimeout(() => setStatus('idle'), 1000);
    }
  };

  const borderColor =
    status === 'success'
      ? 'rgba(52,211,153,0.35)'
      : status === 'wrong'
      ? 'rgba(248,113,113,0.35)'
      : 'rgba(255,255,255,0.08)';

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2
          className="text-lg font-bold text-[#EEF2F7]"
          style={{ fontFamily: '"Space Grotesk", sans-serif' }}
        >
          Puzzle Arena
        </h2>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{
            background: 'rgba(56,189,248,0.08)',
            border: '1px solid rgba(56,189,248,0.20)',
            color: '#38BDF8',
          }}
        >
          Active
        </span>
      </div>

      <div
        className="relative overflow-hidden rounded-xl transition-all duration-400"
        style={{
          background: '#131A27',
          border: `1px solid ${borderColor}`,
        }}
      >
        {/* Points badge */}
        <div
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(248,192,59,0.08)',
            border: '1px solid rgba(248,192,59,0.20)',
          }}
        >
          <span className="text-xs">⚡</span>
          <span className="text-xs font-bold text-[#F8C03B]">{puzzle.points} pts</span>
        </div>

        <div className="p-6 md:p-8">
          {/* Question */}
          <div className="mb-7">
            <p className="text-xs uppercase tracking-widest text-[#4D5A70] mb-3 font-medium">
              Current Puzzle
            </p>
            <blockquote
              className="text-base md:text-lg text-[#EEF2F7] leading-relaxed font-medium border-l-2 pl-4"
              style={{ borderColor: '#38BDF8' }}
            >
              "{puzzle.question}"
            </blockquote>
          </div>

          {/* Hint toggle */}
          {!showHint && status !== 'success' && (
            <button
              onClick={() => setShowHint(true)}
              className="text-xs text-[#4D5A70] hover:text-[#8896A7] transition-colors duration-200 mb-5 flex items-center gap-1.5 cursor-pointer"
            >
              <span>💡</span> Show hint{attempts >= 2 ? ' (you need this)' : ''}
            </button>
          )}

          <AnimatePresence>
            {showHint && status !== 'success' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 overflow-hidden"
              >
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm"
                  style={{
                    background: 'rgba(56,189,248,0.06)',
                    border: '1px solid rgba(56,189,248,0.15)',
                  }}
                >
                  <span>💡</span>
                  <span className="italic text-[#8896A7]">{puzzle.hint}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer / success */}
          <AnimatePresence mode="wait">
            {status !== 'success' ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex gap-3"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  className="cyber-input flex-1 px-4 py-3 rounded-xl text-sm"
                  autoComplete="off"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all duration-200 flex-shrink-0"
                  style={{
                    background: status === 'wrong'
                      ? 'rgba(248,113,113,0.12)'
                      : 'rgba(56,189,248,0.12)',
                    border: status === 'wrong'
                      ? '1px solid rgba(248,113,113,0.35)'
                      : '1px solid rgba(56,189,248,0.30)',
                    color: status === 'wrong' ? '#F87171' : '#38BDF8',
                  }}
                >
                  {status === 'wrong' ? '✗' : '→'}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', bounce: 0.35, duration: 0.5 }}
                className="text-center py-8 relative"
              >
                {Array.from({ length: 30 }).map((_, i) => (
                  <ConfettiPiece
                    key={i}
                    color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
                    index={i}
                  />
                ))}
                <motion.div
                  className="text-5xl mb-4"
                  animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6 }}
                >
                  🎉
                </motion.div>
                <p
                  className="text-xl font-black mb-2"
                  style={{ fontFamily: '"Space Grotesk", sans-serif', color: '#34D399' }}
                >
                  Correct!
                </p>
                <p className="text-[#8896A7] text-sm">
                  The answer was{' '}
                  <span className="font-bold text-[#34D399]">"{puzzle.answer}"</span>.{' '}
                  +{puzzle.points} points awarded!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
