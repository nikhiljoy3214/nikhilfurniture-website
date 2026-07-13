import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  trend?: {
    type: 'up' | 'down' | 'neutral';
    value: string;
  };
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  loading = false,
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-wood-200/40 shadow-sm flex flex-col gap-4 transition-all duration-300 hover:shadow-md hover:border-wood-300/40">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-wood-500 font-bold font-sans">
          {title}
        </span>
        <div className="w-10 h-10 rounded-xl bg-wood-50 border border-wood-100 flex items-center justify-center text-wood-700">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {loading ? (
          <div className="h-9 w-24 bg-wood-100 rounded-lg animate-pulse" />
        ) : (
          <h3 className="font-serif text-3xl font-bold text-wood-950 tracking-tight">
            {value}
          </h3>
        )}
        <div className="flex items-center gap-2 text-xs">
          {trend && !loading && (
            <span className={`font-bold font-sans px-2 py-0.5 rounded-full ${
              trend.type === 'up' 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                : trend.type === 'down' 
                ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                : 'bg-wood-50 text-wood-600 border border-wood-100'
            }`}>
              {trend.value}
            </span>
          )}
          <span className="text-wood-500 leading-relaxed font-semibold">
            {description}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
