import React from 'react';
import { ProcessedScheduleItem } from '../types';

interface ScheduleViewProps {
  schedule: ProcessedScheduleItem[];
}

const parseDateAsUTC = (dateString: string): Date => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return new Date(NaN);
    }
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
};

const formatDate = (dateString: string) => {
    const date = parseDateAsUTC(dateString);
    // Se añade timeZone: 'UTC' para evitar que la zona horaria local cambie la fecha.
    return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(date);
};

const ScheduleView: React.FC<ScheduleViewProps> = ({ schedule }) => {
    const todayRef = React.useRef<HTMLTableRowElement>(null);

    React.useEffect(() => {
        if(todayRef.current) {
            setTimeout(() => {
                 todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }, [schedule]);


    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cronograma de Avance</h2>
            <div className="overflow-y-auto max-h-96 custom-scrollbar pr-2">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-500">Fecha</th>
                            <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-500">Actividad Programada</th>
                            <th scope="col" className="py-3.5 px-3 text-right text-sm font-semibold text-gray-500">Puntaje Esperado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {schedule.map((item, index) => {
                            const isCurrentDay = item.isCurrentDay;
                            const rowClasses = isCurrentDay 
                                ? 'bg-slate-800' 
                                : 'hover:bg-gray-50';
                            
                            const textClasses = isCurrentDay 
                                ? 'text-white'
                                : 'text-gray-900';
                            
                            const secondaryTextClasses = isCurrentDay 
                                ? 'text-gray-300'
                                : 'text-gray-500';

                            const courseNameParts = item.course.split('. ');
                            const courseNumber = courseNameParts[0];
                            const courseTitle = courseNameParts.slice(1).join('. ');

                            return (
                                <tr 
                                    key={index}
                                    ref={isCurrentDay ? todayRef : null}
                                    className={`${rowClasses} transition-colors`}
                                >
                                    <td className={`whitespace-nowrap py-3 px-3 text-sm font-medium capitalize ${isCurrentDay ? 'text-sky-300' : textClasses}`}>
                                        {formatDate(item.date)}
                                    </td>
                                    <td className="py-3 px-3 text-sm">
                                        <p className={`font-medium ${textClasses}`}>{`Módulo ${item.moduleNumber}: ${item.module}`}</p>
                                        <p className={`text-xs ${secondaryTextClasses}`}>{`Curso ${courseNumber}: ${courseTitle}`}</p>
                                    </td>
                                    <td className={`whitespace-nowrap py-3 px-3 text-right text-sm font-semibold ${isCurrentDay ? 'text-sky-300' : 'text-sky-600'}`}>
                                        {item.expectedPoints.toFixed(0)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ScheduleView;