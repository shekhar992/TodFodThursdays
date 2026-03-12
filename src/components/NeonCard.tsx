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

const variantBorder: Record<NeonVariant, string> = {
  blue:   'rgba(56, 189, 248, 0.20)',
  purple: 'rgba(99, 102, 241, 0.20)',
  pink:   'rgba(245, 158, 11, 0.20)',
  green:  'rgba(52, 211, 153, 0.20)',
};

const variantHoverBorder: Record<NeonVariant, string> = {
  blue:   'rgba(56, 189, 248, 0.40)',
  purple: 'rgba(99, 102, 241, 0.40)',
  pink:   'rgba(245, 158, 11, 0.40)',
  green:  'rgba(52, 211, 153, 0.40)',
};

export function NeonCard({ children, variant = 'purple', hover = true, className = '', style }: NeonCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`rounded-xl p-6 transition-all duration-200 ${className}`}
      style={{
        background: '#131A27',
        border: `1px solid ${variantBorder[variant]}`,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hover) (e.currentTarget as HTMLDivElement).style.borderColor = variantHoverBorder[variant];
      }}
      onMouseLeave={(e) => {
        if (hover) (e.currentTarget as HTMLDivElement).style.borderColor = variantBorder[variant];
      }}
    >
      {children}
    </motion.div>
  );
}
