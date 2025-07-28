import React, { useState, useMemo } from 'react';
import { ProcessedScheduleItem } from '../../types';

interface CatchUpPlannerProps {
    processedSchedule: ProcessedScheduleItem[];
    today: Date;
    courseNames: string[];
    getExpectedPointsForDate: (date: Date) => number;
    expectedPointsToday: number;
}

interface Plan {
    pointsNeeded: number;
    modulesToCover: {
        course: string;
        module: string;
        moduleNumber: number;
        suggestedDate: string;
    }[];
    totalPomodoros: number;
    suggestedDays: number;
}

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
};

const formatDateForPlan = (dateString: string): string => {
    // Add time part to ensure the date is parsed correctly in UTC
    const date = new Date(dateString + 'T00:00:00Z');
    return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(date);
};

const CatchUpPlanner: React.FC<CatchUpPlannerProps> = ({
    processedSchedule,
    today,
    courseNames,
    getExpectedPointsForDate,
    expectedPointsToday
}) => {
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedModule, setSelectedModule] = useState('');
    const [plan, setPlan] = useState<Plan | null>(null);

    const availableModules = useMemo(() => {
        if (!selectedCourse) return [];
        const modules = processedSchedule
            .filter(item => item.course === selectedCourse)
            .map(item => ({ name: item.module, number: item.moduleNumber }));
        
        const uniqueModules = [...new Map(modules.map(item => [item.name, item])).values()];
        uniqueModules.sort((a,b) => a.number - b.number);
        return uniqueModules.map(item => item.name);

    }, [selectedCourse, processedSchedule]);

    const handleGeneratePlan = () => {
        if (!selectedCourse || !selectedModule) return;

        const userLastScheduledDay = [...processedSchedule]
            .reverse()
            .find(item => item.course === selectedCourse && item.module === selectedModule);

        if (!userLastScheduledDay) return;
        
        const userCurrentPoints = userLastScheduledDay.expectedPoints;
        const pointsNeeded = Math.round(expectedPointsToday - userCurrentPoints);

        if (pointsNeeded <= 0) {
            setPlan({ pointsNeeded: 0, modulesToCover: [], totalPomodoros: 0, suggestedDays: 0 });
            return;
        }
        
        const todayString = today.toISOString().split('T')[0];
        
        const userLastDayIndex = processedSchedule.findIndex(item => item.date === userLastScheduledDay.date && item.module === userLastScheduledDay.module);
        const todayIndex = processedSchedule.findIndex(item => item.date === todayString);
        
        const effectiveTodayIndex = todayIndex > -1 ? todayIndex : processedSchedule.length -1;

        const scheduleSlice = processedSchedule.slice(userLastDayIndex + 1, effectiveTodayIndex + 1);

        const uniqueModules = Array.from(new Map(scheduleSlice.map(item => [
            item.module, { course: item.course, module: item.module, moduleNumber: item.moduleNumber }
        ])).values());
        
        const modulesWithDates = uniqueModules.map((mod, index) => {
            const daysToAdd = Math.floor(index / 2); // 2 modules per day
            const suggestedDate = addDays(today, daysToAdd);
            return {
                ...mod,
                suggestedDate: suggestedDate.toISOString().split('T')[0]
            };
        });

        const POMODOROS_PER_MODULE = 3;
        const totalPomodoros = uniqueModules.length * POMODOROS_PER_MODULE;
        const suggestedDays = modulesWithDates.length > 0 ? Math.ceil(modulesWithDates.length / 2) : 0;

        setPlan({
            pointsNeeded,
            modulesToCover: modulesWithDates,
            totalPomodoros,
            suggestedDays
        });
    };

    const handleReset = () => {
        setPlan(null);
        setSelectedCourse('');
        setSelectedModule('');
    };

    if (plan) {
        const planByDate = plan.modulesToCover.reduce((acc, mod) => {
            const date = mod.suggestedDate;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(mod);
            return acc;
        }, {} as Record<string, typeof plan.modulesToCover>);
        
        return (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Tu Plan de Puesta al Día</h3>
                    <button onClick={handleReset} className="text-sm font-semibold text-sky-600 hover:text-sky-500">Crear Nuevo Plan</button>
                </div>

                {plan.pointsNeeded === 0 ? (
                     <div className="text-center bg-green-50 text-green-800 p-8 rounded-lg">
                        <h4 className="text-2xl font-bold mb-2">¡Felicidades! 🎉</h4>
                        <p>Según tu selección, ¡ya estás al día con el cronograma! Sigue así.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                             <div className="bg-amber-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-amber-700">Puntos que te Faltan</p>
                                <p className="text-3xl font-bold text-amber-800">{plan.pointsNeeded}</p>
                            </div>
                            <div className="bg-sky-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-sky-700">Plan Sugerido</p>
                                <p className="text-3xl font-bold text-sky-800">{plan.suggestedDays} {plan.suggestedDays > 1 ? 'Días' : 'Día'}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-800 mb-3">Tu cronograma de estudio ({plan.suggestedDays} {plan.suggestedDays > 1 ? 'días' : 'día'}):</h4>
                            <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                               {Object.entries(planByDate).map(([dateStr, modulesOnDate]) => (
                                   <div key={dateStr}>
                                        <h5 className="font-bold text-gray-700 bg-gray-100 p-2 rounded-t-lg border-b-2 border-sky-200 sticky top-0">
                                            {formatDateForPlan(dateStr)}
                                        </h5>
                                        <div className="border border-t-0 border-gray-200 rounded-b-lg p-1 space-y-1">
                                            {modulesOnDate.map((mod, index) => (
                                                <div key={index} className="bg-white p-3 rounded-lg flex items-center justify-between hover:bg-sky-50/50">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{`Módulo ${mod.moduleNumber}: ${mod.module}`}</p>
                                                        <p className="text-xs text-gray-500">{mod.course}</p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0 ml-2">
                                                        <p className="font-semibold text-sky-600 text-sm">~3 Pomodoros</p>
                                                        <p className="text-xs text-gray-500">~1.5 horas</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                   </div>
                               ))}
                            </div>
                        </div>

                        <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                             <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                                ¿Qué es la Técnica Pomodoro?
                             </h4>
                             <p className="text-sm text-gray-600">Es un método de estudio simple: concéntrate totalmente en una tarea por <span className="font-bold">25 minutos</span>, y luego toma un <span className="font-bold">descanso de 5 minutos</span>. Cada ciclo de 25+5 es un "Pomodoro". ¡Es ideal para mantener la concentración!</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Diseñador de Plan de Puesta al Día</h3>
            <p className="text-sm text-gray-500 mb-6">Indica hasta dónde has completado para generar una ruta de estudio y volver al ritmo ideal.</p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-1">1. Selecciona el último curso que trabajaste</label>
                    <select
                        id="course-select"
                        value={selectedCourse}
                        onChange={e => {
                            setSelectedCourse(e.target.value);
                            setSelectedModule('');
                        }}
                        className="w-full bg-gray-50 border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    >
                        <option value="" disabled>Elige un curso...</option>
                        {courseNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="module-select" className="block text-sm font-medium text-gray-700 mb-1">2. Ahora, selecciona el último módulo completado</label>
                    <select
                        id="module-select"
                        value={selectedModule}
                        onChange={e => setSelectedModule(e.target.value)}
                        disabled={!selectedCourse}
                        className="w-full bg-gray-50 border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-sky-500 focus:outline-none disabled:bg-gray-200"
                    >
                        <option value="" disabled>Elige un módulo...</option>
                        {availableModules.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>

                <button
                    onClick={handleGeneratePlan}
                    disabled={!selectedCourse || !selectedModule}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    Generar Mi Plan
                </button>
            </div>
        </div>
    );
};

export default CatchUpPlanner;
