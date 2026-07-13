import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface QuickActionProps {
  label: string;
  icon: LucideIcon;
  description: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const QuickActionCard: React.FC<QuickActionProps> = ({
  label,
  icon: Icon,
  description,
  onClick,
  variant = 'secondary',
}) => {
  return (
    <button
      onClick={onClick}
      className={`text-left p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 hover:scale-[1.01] hover:shadow-sm w-full ${
        variant === 'primary'
          ? 'bg-wood-800 text-white border-wood-900 hover:bg-wood-900'
          : 'bg-white text-wood-950 border-wood-200/40 hover:border-wood-300 hover:bg-wood-50/20'
      }`}
    >
      <div className={`p-3 rounded-xl flex-shrink-0 flex items-center justify-center ${
        variant === 'primary' 
          ? 'bg-wood-700 text-gold-300 border border-wood-600' 
          : 'bg-wood-50 text-wood-700 border border-wood-100'
      }`}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold font-sans tracking-wide">
          {label}
        </span>
        <span className={`text-xs font-semibold font-sans leading-relaxed ${
          variant === 'primary' ? 'text-wood-200' : 'text-wood-500'
        }`}>
          {description}
        </span>
      </div>
    </button>
  );
};

export default QuickActionCard;
