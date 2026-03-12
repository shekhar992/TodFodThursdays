import { motion } from 'framer-motion';
import type { CSSProperties, ReactNode } from 'react';

type NeonVariant = 'blue' | 'purple' | 'pink' | 'green';

interface NeonCardProps {
  children: ReactNode;
  variant?: NeonVariant;
  hover?: boolean;
  className?: string;
  style?: CSSProperties;
}

const variantStyles: Record<NeonVariant, string> = {
  blue: 'border-[#00E5FF33] hover:border-[#00E5FF88] hover:shadow-[0_0_30px_#00E5FF22,0_0_60px_#00E5FF0A]',
  purple: 'border-[#7A5CFF33] hover:border-[#7A5CFF88] hover:shadow-[0_0_30px_#7A5CFF22,0_0_60px_#7A5CFF0A]',
  pink: 'border-[#FF2E8833] hover:border-[#FF2E8888] hover:shadow-[0_0_30px_#FF2E8822,0_0_60px_#FF2E880A]',
  green: 'border-[#00FFC633] hover:border-[#00FFC688] hover:shadow-[0_0_30px_#00FFC622,0_0_60px_#00FFC60A]',
};

export function NeonCard({ children, variant = 'purple', hover = true, className = '', style }: NeonCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`
        glass rounded-xl border p-6
        transition-all duration-300
        ${variantStyles[variant]}
        ${className}
      `}
      style={style}
    >
      {children}
    </motion.div>
  );
}
