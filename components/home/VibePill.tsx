'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface VibePillProps {
  icon: LucideIcon;
  label: string;
  description: string;
  value: string;
  isSelected: boolean;
  onClick: () => void;
}

export function VibePill({
  icon: Icon,
  label,
  description,
  value,
  isSelected,
  onClick,
}: VibePillProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative p-6 rounded-2xl border-2 text-left transition-all duration-200',
        isSelected
          ? 'border-terracotta bg-terracotta/5 shadow-lg'
          : 'border-stone bg-white hover:border-stone-dark hover:shadow-md'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
            isSelected ? 'bg-terracotta text-white' : 'bg-stone text-anthracite'
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-serif font-semibold text-lg mb-1">{label}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {isSelected && (
        <motion.div
          layoutId="selected-indicator"
          className="absolute top-4 right-4 w-6 h-6 rounded-full bg-terracotta flex items-center justify-center"
        >
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}
