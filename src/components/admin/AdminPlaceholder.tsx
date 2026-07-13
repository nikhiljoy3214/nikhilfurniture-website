import React from 'react';
import { Construction } from 'lucide-react';

interface AdminPlaceholderProps {
  name: string;
}

export const AdminPlaceholder: React.FC<AdminPlaceholderProps> = ({ name }) => {
  return (
    <div className="flex-grow p-6 md:p-8 flex flex-col justify-center items-center min-h-[400px]">
      <div className="bg-wood-100/60 border border-wood-200/40 p-8 rounded-3xl max-w-md w-full text-center flex flex-col items-center gap-5 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-600 animate-pulse">
          <Construction className="w-8 h-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-2xl font-bold text-wood-950">{name} Module</h2>
          <p className="font-sans text-sm text-wood-600 leading-relaxed">
            This module is currently under development. The database tables and schemas are ready to support {name.toLowerCase()} configurations.
          </p>
        </div>
        <div className="w-full h-[1px] bg-wood-200/60" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-wood-400 font-bold">
          CMS Foundation Active
        </span>
      </div>
    </div>
  );
};

export default AdminPlaceholder;
