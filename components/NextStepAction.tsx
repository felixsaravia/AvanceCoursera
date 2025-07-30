import React from 'react';
import { Status } from '../types';

interface NextStepData {
    pointsNeeded: number;
    currentStatus: Status;
    nextStatus: Status;
}

interface NextStepActionProps {
    data: NextStepData | null;
}

const NextStepAction: React.FC<NextStepActionProps> = ({ data }) => {
    if (!data || data.pointsNeeded <= 0) {
        return null;
    }

    const { pointsNeeded, currentStatus, nextStatus } = data;
    const isFinal = nextStatus === Status.Finalizada;
    
    const title = isFinal ? "¡Casi en la meta!" : "¡Estás a un paso!";
    const message = isFinal 
        ? `Con solo <span class="font-bold">${pointsNeeded}</span> ${pointsNeeded === 1 ? 'punto más' : 'puntos más'}, completarás la certificación.`
        : `Con solo <span class="font-bold">${pointsNeeded}</span> ${pointsNeeded === 1 ? 'punto más' : 'puntos más'}, pasarás de <span class="font-semibold">"${currentStatus}"</span> a <span class="font-semibold">"${nextStatus}"</span>.`;

    return (
        <div className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white p-6 rounded-lg shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-left">
                <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.11S7.09 9.81 7.94 9.1c1.26-1.5 5-2 5-2s-.5 3.74-2 5c-.84.71-2.3.7-3.11.05s-1.66-1.66-1.11-2.51c.55-.85 1.26-1.5 2.51-1.11zM21.5 2.5 19 5Z"/></svg>
                </div>
                <div>
                    <h3 className="font-bold text-xl">{title}</h3>
                    <p className="mt-1" dangerouslySetInnerHTML={{ __html: message }} />
                </div>
            </div>
            <a 
                href="https://www.coursera.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-shrink-0 w-full sm:w-auto bg-white text-indigo-600 font-bold py-3 px-6 rounded-lg shadow hover:bg-gray-100 transition-transform transform hover:scale-105"
            >
                Ir a Coursera
            </a>
        </div>
    );
};

export default NextStepAction;
