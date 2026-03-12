import { motion } from 'framer-motion';

export type Role = 'player' | 'admin';

interface DevRoleSwitcherProps {
  role: Role;
  onRoleChange: (role: Role) => void;
}

export function DevRoleSwitcher({ role, onRoleChange }: DevRoleSwitcherProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs font-medium text-[#4D5A70] uppercase tracking-wider hidden sm:block">View As</span>
      <div
        className="flex items-center rounded-lg p-0.5 gap-0.5"
        style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {(['player', 'admin'] as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => onRoleChange(r)}
            className="relative px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors duration-200 cursor-pointer capitalize"
            style={{ zIndex: 1 }}
          >
            {role === r && (
              <motion.div
                layoutId="role-pill"
                className="absolute inset-0 rounded-md"
                style={{
                  background:
                    r === 'admin'
                      ? 'rgba(245,158,11,0.18)'
                      : 'rgba(56,189,248,0.15)',
                  border:
                    r === 'admin'
                      ? '1px solid rgba(245,158,11,0.35)'
                      : '1px solid rgba(56,189,248,0.30)',
                }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
              />
            )}
            <span
              className="relative z-10"
              style={{
                color: role === r
                  ? (r === 'admin' ? '#F59E0B' : '#38BDF8')
                  : 'rgba(238,242,247,0.3)',
              }}
            >
              {r === 'admin' ? 'Admin' : 'Player'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
