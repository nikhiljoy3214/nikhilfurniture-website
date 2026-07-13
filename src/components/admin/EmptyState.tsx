import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  action,
}) => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 min-h-[220px] rounded-2xl border border-dashed border-wood-200 bg-wood-50/10">
      <div className="w-12 h-12 rounded-xl bg-wood-50 border border-wood-100 flex items-center justify-center text-wood-400 mb-4 shadow-sm">
        <Icon className="w-6 h-6" />
      </div>
      <h5 className="font-serif text-base font-bold text-wood-950 mb-1">
        {title}
      </h5>
      <p className="font-sans text-xs text-wood-500 max-w-[280px] leading-relaxed mb-5 font-semibold">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-wood-800 hover:bg-wood-900 text-white border-none py-2 px-4 rounded-xl text-xs font-bold font-sans uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
