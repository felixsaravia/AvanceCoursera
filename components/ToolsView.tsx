import React, { useState } from 'react';
import { ProcessedScheduleItem } from '../types';
import PomodoroTimer from './tools/PomodoroTimer';
import AIQuickQuestion from './tools/AIQuickQuestion';
import CreativeIdeaGenerator from './tools/CreativeIdeaGenerator';
import AIInterviewSimulator from './tools/AIInterviewSimulator';
import AIImageQuery from './tools/AIImageQuery';
import CatchUpPlanner from './tools/CatchUpPlanner';

type Tool = 'pomodoro' | 'ai-question' | 'creative-idea' | 'ai-interview-simulator' | 'ai-image-query' | 'catch-up-planner' | null;

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

interface ToolsViewProps {
    processedSchedule: ProcessedScheduleItem[];
    today: Date;
    courseNames: string[];
    getExpectedPointsForDate: (date: Date) => number;
    expectedPointsToday: number;
}

const GeminiIcon = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L9.5 8.5L4 11L9.5 13.5L12 19L14.5 13.5L20 11L14.5 8.5L12 3Z"/></svg>;


const ToolsView: React.FC<ToolsViewProps> = ({ processedSchedule, today, courseNames, getExpectedPointsForDate, expectedPointsToday }) => {
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
            case 'ai-image-query':
                return <AIImageQuery />;
            case 'catch-up-planner':
                return <CatchUpPlanner 
                    processedSchedule={processedSchedule}
                    today={today}
                    courseNames={courseNames}
                    getExpectedPointsForDate={getExpectedPointsForDate}
                    expectedPointsToday={expectedPointsToday}
                />;
            default:
                return null;
        }
    };

    const toolMenu = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ToolCard
                onClick={() => setActiveTool('catch-up-planner')}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M11 16h6"/><path d="m8 16-2-2 2-2"/></svg>}
                title="Plan de Puesta al Día"
                description="Diseña un plan de estudio personalizado para alcanzar el ritmo del grupo."
            />
            <ToolCard
                onClick={() => setActiveTool('pomodoro')}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
                title="Temporizador Pomodoro"
                description="Concéntrate con la técnica Pomodoro. 25 min de trabajo, 5 de descanso."
            />
            <ToolCard
                onClick={() => setActiveTool('ai-question')}
                icon={GeminiIcon}
                title="Consulta Rápida con IA"
                description="Haz una pregunta rápida a la IA y obtén una respuesta al instante."
            />
            <ToolCard
                onClick={() => setActiveTool('creative-idea')}
                icon={GeminiIcon}
                title="Impulso Motivacional"
                description="Recibe una dosis de ánimo para seguir adelante con tus estudios."
            />
            <ToolCard
                onClick={() => setActiveTool('ai-interview-simulator')}
                icon={GeminiIcon}
                title="Simulador de Entrevistas"
                description="Practica para entrevistas de soporte de TI y recibe feedback de la IA."
            />
            <ToolCard
                onClick={() => setActiveTool('ai-image-query')}
                icon={GeminiIcon}
                title="Consulta con Imagen"
                description="Sube una imagen de un componente o error y pregunta qué es."
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