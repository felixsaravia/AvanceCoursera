import React from 'react';

interface TrophyBadgeProps {
  isUnlocked: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const TrophyBadge: React.FC<TrophyBadgeProps> = ({ isUnlocked, title, description, icon }) => {
    const unlockedClasses = "bg-sky-50 border-sky-300";
    const lockedClasses = "bg-gray-100 border-gray-200 opacity-60";

    const iconUnlockedClasses = "text-sky-500";
    const iconLockedClasses = "text-gray-400";

    const titleUnlockedClasses = "text-sky-900";
    const titleLockedClasses = "text-gray-600";

    const descUnlockedClasses = "text-sky-700";
    const descLockedClasses = "text-gray-500";
    
    return (
        <div 
            title={isUnlocked ? `${title}: ¡Desbloqueado!` : `${title}: ${description}`}
            className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-300 ${isUnlocked ? unlockedClasses : lockedClasses}`}
        >
            <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full ${isUnlocked ? 'bg-white' : 'bg-gray-200'}`}>
                <span className={isUnlocked ? iconUnlockedClasses : iconLockedClasses}>
                    {icon}
                </span>
            </div>
            <div className="flex-grow">
                <h4 className={`font-bold text-md ${isUnlocked ? titleUnlockedClasses : titleLockedClasses}`}>{title}</h4>
                <p className={`text-sm ${isUnlocked ? descUnlockedClasses : descLockedClasses}`}>{description}</p>
            </div>
        </div>
    );
};

export default TrophyBadge;
