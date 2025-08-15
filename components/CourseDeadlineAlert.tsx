import React, { useState, useEffect } from 'react';

interface CourseDeadlineAlertProps {
    daysRemaining: number;
    courseName: string;
    motivationalPhrase: string;
    isMuted: boolean;
}

const CourseDeadlineAlert: React.FC<CourseDeadlineAlertProps> = ({ daysRemaining, courseName, motivationalPhrase, isMuted }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasBeenShown = sessionStorage.getItem('deadlineAlertShown');
        if (!hasBeenShown && !isMuted) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [isMuted]);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('deadlineAlertShown', 'true');
    };

    if (!isVisible) {
        return null;
    }

    const courseShortName = courseName.split('. ').slice(1).join('. ');

    const daysText = daysRemaining === 0
        ? "Hoy es el último día"
        : `Quedan ${daysRemaining} ${daysRemaining === 1 ? 'día' : 'días'}`;

    return (
        <div role="alert" aria-live="assertive" className="fixed top-5 right-5 z-[100] w-full max-w-sm bg-white rounded-xl shadow-2xl p-4 border border-gray-200 animate-fade-in-right">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </div>
                <div className="flex-grow">
                    <p className="text-sm font-medium text-gray-800 leading-tight">
                        {daysText} para que finalice el curso: <span className="font-bold">{courseShortName}</span>.
                    </p>
                    <p className="text-sm text-gray-600 mt-2 italic">
                        {motivationalPhrase}
                    </p>
                </div>
                <button onClick={handleDismiss} aria-label="Cerrar alerta" className="text-gray-400 hover:text-gray-600 rounded-full p-1 -mt-2 -mr-2 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>
        </div>
    );
};

export default CourseDeadlineAlert;