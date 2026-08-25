import React from 'react';
import { BILLER_CATEGORIES } from '../data/mockData';
import { BillerCategory } from '../types';
import {
  Smartphone,
  Zap,
  Car,
  Tv,
  Wifi,
  Flame,
  ChevronRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface BillsSectionProps {
  onSelectBillerCategory: (category: BillerCategory) => void;
  onSelectSpecificOperator: (category: BillerCategory, operatorId: string) => void;
}

export const BillsSection: React.FC<BillsSectionProps> = ({
  onSelectBillerCategory,
  onSelectSpecificOperator,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="w-5 h-5 text-blue-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Car':
        return <Car className="w-5 h-5 text-emerald-400" />;
      case 'Tv':
        return <Tv className="w-5 h-5 text-purple-400" />;
      case 'Wifi':
        return <Wifi className="w-5 h-5 text-cyan-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-orange-400" />;
      default:
        return <CreditCard className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <section className="px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Bills & Recharges
            </h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              BBPS Assured
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {BILLER_CATEGORIES.map((category) => (
            <button
              key={category.id}
              id={`biller-cat-${category.id}`}
              onClick={() => {
                sound.playKeyClick();
                onSelectBillerCategory(category);
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all duration-150 active:scale-95 group text-center"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-800/80 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-inner">
                {getIcon(category.icon)}
              </div>
              <span className="text-xs font-medium text-slate-200 line-clamp-1 group-hover:text-emerald-300">
                {category.name}
              </span>
              <span className="text-[9px] text-slate-500 line-clamp-1">
                {category.description.split(',')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
