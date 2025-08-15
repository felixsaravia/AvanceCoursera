import React, { useMemo } from 'react';
import { Student, Status } from '../types';
import { STATUS_CONFIG, orderedStatuses, COURSE_NAMES, COURSE_SHORT_NAMES } from '../constants';

interface DonutChartProps {
  data: {
    value: number;
    label: string;
    color: string; // Tailwind text color class e.g., 'text-green-500'
  }[];
  totalValue: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, totalValue }) => {
  const size = 200;
  const strokeWidth = 25;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
      <div className="relative flex-shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f3f4f6" // gray-100
            strokeWidth={strokeWidth}
          />
          {data.map((item, index) => {
            if(item.value === 0) return null;

            const percentage = (item.value / totalValue) * 100;
            const currentRotation = accumulatedPercentage * 3.6;
            accumulatedPercentage += percentage;
            
            return (
              <circle
                key={index}
                className={item.color}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={`${(percentage / 100) * circumference} ${circumference}`}
                transform={`rotate(${currentRotation - 90} ${size / 2} ${size / 2})`}
                style={{ transition: 'all 0.5s ease-out' }}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-extrabold text-gray-900">{totalValue}</span>
          <span className="text-sm font-medium text-gray-500">Estudiantes</span>
        </div>
      </div>
      <div className="w-full sm:w-auto">
        <ul className="space-y-3">
          {data.map((item, index) => (
            <li key={index} className="flex items-center text-sm">
              <span className={`w-3.5 h-3.5 rounded-full mr-3 ${item.color.replace('text-','bg-')}`}></span>
              <span className="text-gray-600 mr-2">{item.label}:</span>
              <span className="font-bold text-gray-800">{item.value}</span>
              <span className="text-gray-500 ml-1.5">({totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(0) : 0}%)</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};


interface StatisticsViewProps {
  students: Student[];
}

const StatCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description?: string;
  colorClass: string;
}> = ({ icon, title, value, description, colorClass }) => {
  return (
    <div className={`p-5 rounded-lg border shadow-sm flex items-start gap-4 ${colorClass}`}>
      <div className="flex-shrink-0 mt-1">{icon}</div>
      <div className="flex-grow">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
    </div>
  );
};

const CourseStatCard: React.FC<{
    courseName: string;
    fullName: string;
    completed: number;
    total: number;
}> = ({ courseName, fullName, completed, total }) => {
    const isAllCompleted = completed === total && total > 0;
    return (
        <div className={`p-4 rounded-lg border text-center transition-colors duration-300 ${isAllCompleted ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`text-xs font-bold truncate ${isAllCompleted ? 'text-green-800' : 'text-gray-700'}`} title={fullName}>{courseName}</p>
            <p className={`text-3xl font-bold mt-2 ${isAllCompleted ? 'text-green-900' : 'text-gray-900'}`}>{completed} <span className="text-base font-medium text-gray-500">/ {total}</span></p>
        </div>
    );
};

const CHART_COLORS: { [key in Status]: string } = {
    [Status.Finalizada]: 'text-yellow-400',
    [Status.EliteII]: 'text-fuchsia-400',
    [Status.EliteI]: 'text-violet-400',
    [Status.Avanzada]: 'text-sky-400',
    [Status.AlDia]: 'text-green-400',
    [Status.Atrasada]: 'text-orange-400',
    [Status.Riesgo]: 'text-red-500',
    [Status.SinIniciar]: 'text-gray-400',
};

const StatisticsView: React.FC<StatisticsViewProps> = ({ students }) => {
    
    const stats = useMemo(() => {
        if (students.length === 0) {
            return {
                averageScore: 0,
                completedCount: 0,
                donutChartData: orderedStatuses.map(status => ({
                    label: status,
                    value: 0,
                    color: CHART_COLORS[status],
                })),
                courseCompletions: [],
            };
        }

        const totalPointsSum = students.reduce((sum, s) => sum + s.totalPoints, 0);
        const averageScore = totalPointsSum / students.length;
        const completedCount = students.filter(s => s.status === Status.Finalizada).length;

        const statusCounts = students.reduce((acc, student) => {
            const status = student.status || Status.SinIniciar;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<Status, number>);

        const donutChartData = orderedStatuses.map(status => ({
            label: status,
            value: statusCounts[status] || 0,
            color: CHART_COLORS[status],
        }));
        
        const courseCompletions = COURSE_NAMES.map((name, index) => {
            const completedCount = students.filter(s => s.courseProgress[index] === 100).length;
            return {
                name: COURSE_SHORT_NAMES[index],
                fullName: name,
                completed: completedCount,
                total: students.length,
            };
        });

        return {
            averageScore,
            completedCount,
            donutChartData,
            courseCompletions,
        };

    }, [students]);

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Estadísticas Gráficas del Grupo</h2>
            <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="bg-gray-50/50 p-6 rounded-lg border border-gray-200/80 h-full flex flex-col justify-center">
                        <h3 className="font-bold text-lg text-gray-900 mb-4 text-center">Distribución de Estado</h3>
                        <DonutChart data={stats.donutChartData} totalValue={students.length} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <StatCard
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>}
                            title="Promedio del Grupo"
                            value={stats.averageScore.toFixed(1)}
                            description="Puntos en promedio"
                            colorClass="bg-sky-50 border-sky-200"
                        />
                         <StatCard
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>}
                            title="Certificación Completada"
                            value={stats.completedCount}
                            description="Estudiantes que finalizaron"
                            colorClass="bg-yellow-50 border-yellow-200"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-4">Finalización por Curso</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {stats.courseCompletions.map(course => (
                           <CourseStatCard 
                            key={course.fullName}
                            courseName={course.name}
                            fullName={course.fullName}
                            completed={course.completed}
                            total={course.total}
                           />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsView;
