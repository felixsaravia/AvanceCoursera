import React from 'react';

interface AchievementBadgeProps {
  isUnlocked: boolean;
  title: string;
  subtitle:string;
  isFinal?: boolean;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ isUnlocked, title, subtitle, isFinal = false }) => {
    
    const colors = {
        unlocked: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-300',
            iconContainerBg: 'bg-yellow-400',
            iconColor: 'text-white',
            titleColor: 'text-yellow-900',
            subtitleColor: 'text-yellow-700'
        },
        locked: {
            bg: 'bg-gray-100',
            border: 'border-gray-200',
            iconContainerBg: 'bg-gray-300',
            iconColor: 'text-gray-500',
            titleColor: 'text-gray-600',
            subtitleColor: 'text-gray-400'
        },
        finalUnlocked: {
            bg: 'bg-gradient-to-br from-sky-50 to-indigo-100',
            border: 'border-sky-300',
            iconContainerBg: 'bg-gradient-to-br from-sky-500 to-indigo-500',
            iconColor: 'text-white',
            titleColor: 'text-indigo-900',
            subtitleColor: 'text-sky-700'
        }
    };

    const state = isFinal ? (isUnlocked ? 'finalUnlocked' : 'locked') : (isUnlocked ? 'unlocked' : 'locked');
    const selectedColors = colors[state];

    const icon = isUnlocked ? (
        isFinal ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 17 17 23 15.79 13.88"/>
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
        )
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
    );

  return (
    <div className={`flex flex-col items-center justify-start p-3 rounded-xl border-2 text-center transition-all duration-300 ${selectedColors.bg} ${selectedColors.border} h-36`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 flex-shrink-0 transition-all duration-300 ${selectedColors.iconContainerBg}`}>
            <span className={selectedColors.iconColor}>{icon}</span>
        </div>
        <div className="flex-grow flex flex-col justify-center w-full">
            <p className={`font-bold text-sm leading-tight ${selectedColors.titleColor}`}>{title}</p>
            <p className={`text-xs font-medium leading-snug mt-1 ${selectedColors.subtitleColor}`}>{subtitle}</p>
        </div>
    </div>
  );
};

export default AchievementBadge;