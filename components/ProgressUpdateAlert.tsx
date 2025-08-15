import React, { useEffect, useMemo } from 'react';

interface ProgressUpdateAlertProps {
    studentName: string;
    pointsIncrease: number;
    onClose: () => void;
}

const getMotivationalMessage = (studentName: string, pointsIncrease: number): { title: string, message: string } => {
    const firstName = studentName.split(' ')[0];
    if (pointsIncrease <= 0) {
        return { title: 'Progreso Actualizado', message: `Se actualizó el puntaje de ${firstName}.`};
    }
    if (pointsIncrease < 15) {
        return {
            title: `¡Buen trabajo, ${firstName}!`,
            message: `Sumaste ${pointsIncrease} puntos. ¡La constancia es la clave del éxito, sigue así!`
        };
    }
    if (pointsIncrease < 40) {
        return {
            title: `¡Excelente avance, ${firstName}!`,
            message: `¡+${pointsIncrease} puntos! Estás demostrando un enfoque y una dedicación admirables.`
        };
    }
    return {
        title: `¡IMPRESIONANTE, ${firstName}!`,
        message: `¡Lograste ${pointsIncrease} puntos de golpe! Eres una futura líder en TI. ¡El cielo es el límite!`
    };
};

const ProgressUpdateAlert: React.FC<ProgressUpdateAlertProps> = ({ studentName, pointsIncrease, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Alert disappears after 5 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    const { title, message } = useMemo(() => getMotivationalMessage(studentName, pointsIncrease), [studentName, pointsIncrease]);

    return (
        <div role="alert" aria-live="assertive" className="fixed bottom-5 left-5 z-[100] w-full max-w-sm bg-white rounded-xl shadow-2xl p-4 border border-gray-200 animate-fade-in-up">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 12-4-4-4 4"/><path d="m14 12v-10"/><path d="M4 12h10"/><path d="M4 20h16"/></svg>
                </div>
                <div className="flex-grow">
                    <p className="font-bold text-gray-900">{title}</p>
                    <p className="text-sm text-gray-600 mt-1">{message}</p>
                </div>
                <button onClick={onClose} aria-label="Cerrar alerta" className="text-gray-400 hover:text-gray-600 rounded-full p-1 -mt-2 -mr-2 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
            </div>
        </div>
    );
};

export default ProgressUpdateAlert;
