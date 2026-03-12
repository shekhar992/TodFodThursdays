import { motion } from 'framer-motion';

export type Role = 'player' | 'admin';

interface DevRoleSwitcherProps {
  role: Role;
  onRoleChange: (role: Role) => void;
}

export function DevRoleSwitcher({ role, onRoleChange }: DevRoleSwitcherProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-white/40 uppercase tracking-wider">View As:</span>
      <div className="flex items-center bg-[#0F0F1A] border border-white/10 rounded-full p-0.5 gap-0.5">
        {(['player', 'admin'] as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => onRoleChange(r)}
            className="relative px-4 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 cursor-pointer capitalize"
            style={{ zIndex: 1 }}
          >
            {role === r && (
              <motion.div
                layoutId="role-pill"
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    r === 'admin'
                      ? 'linear-gradient(135deg, #FF2E88, #7A5CFF)'
                      : 'linear-gradient(135deg, #00E5FF, #7A5CFF)',
                }}
                transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
              />
            )}
            <span
              className="relative z-10"
              style={{ color: role === r ? '#fff' : 'rgba(255,255,255,0.4)' }}
            >
              {r === 'admin' ? '🔑 Admin' : '🎮 Player'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
