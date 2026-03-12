import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Puzzle } from '../data/mockData';
const CONFETTI_COLORS = ['#00E5FF', '#FF2E88', '#7A5CFF', '#00FFC6', '#FFE600', '#FFD700'];

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
    status === 'success' ? '#00FFC6' : status === 'wrong' ? '#FF2E88' : '#7A5CFF44';

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🧩</span>
        <h2 className="text-2xl font-bold text-white font-[Orbitron]">Puzzle Arena</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-[#7A5CFF44] to-transparent" />
        <span className="text-xs px-2 py-1 rounded-full bg-[#7A5CFF22] border border-[#7A5CFF44] text-[#7A5CFF] uppercase tracking-wider">
          Active
        </span>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border transition-all duration-500"
        style={{
          borderColor,
          background: 'rgba(15, 15, 26, 0.8)',
          boxShadow:
            status === 'success'
              ? '0 0 40px #00FFC644, 0 0 80px #00FFC622'
              : status === 'wrong'
              ? '0 0 20px #FF2E8844'
              : '0 0 20px #7A5CFF11',
        }}
      >
        {/* Background grid effect */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(122,92,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(122,92,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Points badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFD70011] border border-[#FFD70033]">
          <span className="text-xs">⚡</span>
          <span className="text-xs font-bold text-[#FFD700]">{puzzle.points} pts</span>
        </div>

        <div className="relative p-8">
          {/* Question */}
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-[#7A5CFF] mb-3 font-semibold">
              Current Puzzle
            </p>
            <blockquote className="text-lg md:text-xl text-white/90 leading-relaxed font-medium italic border-l-2 border-[#7A5CFF] pl-5">
              "{puzzle.question}"
            </blockquote>
          </div>

          {/* Hint toggle */}
          {!showHint && status !== 'success' && (
            <button
              onClick={() => setShowHint(true)}
              className="text-xs text-white/30 hover:text-[#7A5CFF] transition-colors duration-200 mb-6 flex items-center gap-1.5 cursor-pointer"
            >
              <span>💡</span> Show hint {attempts >= 2 ? '(you need this)' : ''}
            </button>
          )}
          <AnimatePresence>
            {showHint && status !== 'success' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#7A5CFF11] border border-[#7A5CFF22] text-sm text-white/60">
                  <span>💡</span>
                  <span className="italic">{puzzle.hint}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer input */}
          <AnimatePresence mode="wait">
            {status !== 'success' ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex gap-3"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  className="cyber-input flex-1 px-5 py-3.5 rounded-xl text-sm font-medium"
                  autoComplete="off"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-neon px-6 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider cursor-pointer transition-all duration-200"
                  style={{
                    background:
                      status === 'wrong'
                        ? 'linear-gradient(135deg, #FF2E88, #7A5CFF)'
                        : 'linear-gradient(135deg, #7A5CFF, #00E5FF)',
                    color: '#fff',
                    boxShadow: '0 0 20px #7A5CFF44',
                  }}
                >
                  {status === 'wrong' ? '✗ Wrong' : 'Submit'}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
                className="text-center py-8 relative"
              >
                {/* Confetti */}
                {Array.from({ length: 30 }).map((_, i) => (
                  <ConfettiPiece
                    key={i}
                    color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
                    index={i}
                  />
                ))}
                <motion.div
                  className="text-6xl mb-4"
                  animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6 }}
                >
                  🎉
                </motion.div>
                <p
                  className="text-2xl font-black font-[Orbitron] mb-2"
                  style={{ color: '#00FFC6', textShadow: '0 0 20px #00FFC688' }}
                >
                  Correct!
                </p>
                <p className="text-white/60 text-sm">
                  The answer was{' '}
                  <span className="font-bold text-[#00FFC6]">"{puzzle.answer}"</span>.
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
