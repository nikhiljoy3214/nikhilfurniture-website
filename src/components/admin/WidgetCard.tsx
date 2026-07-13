import React from 'react';

interface WidgetCardProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children: React.ReactNode;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  title,
  action,
  children,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-wood-200/40 shadow-sm flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between px-6 py-5 border-b border-wood-100 bg-wood-50/20">
        <h4 className="font-serif text-lg font-bold text-wood-950">
          {title}
        </h4>
        {action && (
          <button
            onClick={action.onClick}
            className="text-xs font-bold text-gold-600 hover:text-gold-700 transition-colors uppercase tracking-wider bg-transparent border-none p-0 cursor-pointer"
          >
            {action.label}
          </button>
        )}
      </div>
      <div className="p-6 flex-grow flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default WidgetCard;
