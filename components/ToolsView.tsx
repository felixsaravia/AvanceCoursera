import React, { useState } from 'react';
import PomodoroTimer from './tools/PomodoroTimer';
import AIQuickQuestion from './tools/AIQuickQuestion';
import CreativeIdeaGenerator from './tools/CreativeIdeaGenerator';
import AIInterviewSimulator from './tools/AIInterviewSimulator';

type Tool = 'pomodoro' | 'ai-question' | 'creative-idea' | 'ai-interview-simulator' | null;

const ToolCard = ({ icon, title, description, onClick, disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-full text-left p-6 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-sky-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
    >
        <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-lg text-sky-600">{icon}</div>
            <div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
        </div>
    </button>
);

const ToolsView: React.FC = () => {
    const [activeTool, setActiveTool] = useState<Tool>(null);

    const renderActiveTool = () => {
        switch (activeTool) {
            case 'pomodoro':
                return <PomodoroTimer />;
            case 'ai-question':
                return <AIQuickQuestion />;
            case 'creative-idea':
                return <CreativeIdeaGenerator />;
            case 'ai-interview-simulator':
                return <AIInterviewSimulator />;
            default:
                return null;
        }
    };

    const toolMenu = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ToolCard
                onClick={() => setActiveTool('pomodoro')}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
                title="Temporizador Pomodoro"
                description="Concéntrate con la técnica Pomodoro. 25 min de trabajo, 5 de descanso."
            />
            <ToolCard
                onClick={() => setActiveTool('ai-question')}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>}
                title="Consulta Rápida con IA"
                description="Haz una pregunta rápida a la IA y obtén una respuesta al instante."
            />
            <ToolCard
                onClick={() => setActiveTool('creative-idea')}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>}
                title="Impulso Motivacional"
                description="Recibe una dosis de ánimo para seguir adelante con tus estudios."
            />
            <ToolCard
                onClick={() => setActiveTool('ai-interview-simulator')}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="12" cy="10" r="2"/><path d="M8 14c0-2 2-3 4-3s4 1 4 3"/></svg>}
                title="Simulador de Entrevistas"
                description="Practica para entrevistas de soporte de TI y recibe feedback de la IA."
            />
        </div>
    );

    return (
        <section className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Herramientas</h2>
                    <p className="text-gray-500 mt-1">Utilidades para potenciar tu aprendizaje.</p>
                </div>
                {activeTool && (
                    <button
                        onClick={() => setActiveTool(null)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Volver
                    </button>
                )}
            </div>

            {activeTool ? renderActiveTool() : toolMenu}
        </section>
    );
};

export default ToolsView;