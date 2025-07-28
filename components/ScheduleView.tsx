import React, { useMemo } from 'react';
import { ProcessedScheduleItem } from '../types';

interface ScheduleViewProps {
  schedule: ProcessedScheduleItem[];
  today: Date;
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

const ScheduleView: React.FC<ScheduleViewProps> = ({ schedule, today }) => {
    const todayRef = React.useRef<HTMLTableRowElement>(null);

    React.useEffect(() => {
        if(todayRef.current) {
            setTimeout(() => {
                 todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }, [schedule]);

    const weeklySchedule = useMemo(() => {
        const todayCopy = new Date(today.getTime());
        const dayOfWeek = todayCopy.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        // If today is Sunday (0), go back 6 days to get to Monday. Otherwise, go back (dayOfWeek - 1) days.
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(todayCopy);
        monday.setUTCDate(todayCopy.getUTCDate() + diff);

        const weekDates: Date[] = Array.from({ length: 6 }).map((_, i) => {
            const day = new Date(monday);
            day.setUTCDate(monday.getUTCDate() + i);
            return day;
        });

        const weekDateStrings = weekDates.map(d => d.toISOString().split('T')[0]);
        const todayDateString = today.toISOString().split('T')[0];

        const scheduleForWeek = schedule.filter(item => weekDateStrings.includes(item.date));

        return weekDates.map(date => {
            const dateString = date.toISOString().split('T')[0];
            const activities = scheduleForWeek.filter(item => item.date === dateString);
            const uniqueModules = Array.from(new Map(activities.map(item => [item.module, item])).values());

            return {
                dayName: new Intl.DateTimeFormat('es-ES', { weekday: 'long', timeZone: 'UTC' }).format(date),
                activities: uniqueModules,
                isToday: dateString === todayDateString,
            };
        });
    }, [schedule, today]);


    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Cronograma de Avance Completo</h2>
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

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                 <h2 className="text-xl font-bold text-gray-900 mb-4">Cronograma de esta Semana</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {weeklySchedule.map((day, index) => (
                        <div key={index} className={`p-4 rounded-lg flex flex-col ${day.isToday ? 'bg-sky-50 border-2 border-sky-400' : 'bg-gray-50 border border-gray-200'}`}>
                            <h3 className={`font-bold capitalize mb-2 pb-2 border-b ${day.isToday ? 'text-sky-700 border-sky-200' : 'text-gray-700 border-gray-200'}`}>{day.dayName}</h3>
                            <div className="flex-grow">
                                {day.activities.length > 0 ? (
                                    <ul className="space-y-3">
                                        {day.activities.map((activity, actIndex) => {
                                             const courseNameParts = activity.course.split('. ');
                                             const courseNumber = courseNameParts[0];
                                             const courseTitle = courseNameParts.slice(1).join('. ');
                                             return (
                                                <li key={actIndex} className="text-sm">
                                                    <p className="font-semibold text-gray-800">{`Módulo ${activity.moduleNumber}: ${activity.module}`}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{`Curso ${courseNumber}: ${courseTitle}`}</p>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-sm text-gray-400 italic">Sin actividades</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ScheduleView;