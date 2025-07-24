import React from 'react';

type Rank = 'Top 3' | 'Top 5' | 'Top 10';

interface RankBadgeProps {
  rank: Rank;
}

const RANK_CONFIG: { [key in Rank]: { icon: React.ReactNode; color: string; textColor: string; label: string; } } = {
    'Top 3': {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
        color: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        label: 'Top 3',
    },
    'Top 5': {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4V2h10v2"/><path d="M12 18.5 9 22l3-1.5 3 1.5-3-3.5"/><path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"/><path d="M12 15v3.5"/></svg>,
        color: 'bg-gray-200',
        textColor: 'text-gray-700',
        label: 'Top 5',
    },
    'Top 10': {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
        color: 'bg-amber-100',
        textColor: 'text-amber-800',
        label: 'Top 10',
    }
};

const RankBadge: React.FC<RankBadgeProps> = ({ rank }) => {
  const config = RANK_CONFIG[rank];

  if (!config) {
    return null;
  }

  return (
    <div title={`Esta estudiante está en el ${rank} del grupo`} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.color} ${config.textColor}`}>
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};

export default RankBadge;