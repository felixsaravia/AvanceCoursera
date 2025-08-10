import React from 'react';
import { TOTAL_MAX_POINTS } from '../constants';

interface Point {
    day: number;
    points: number;
}

interface ProgressChartProps {
    data: {
        studentSeries: Point[];
        expectedSeries: Point[];
        totalDays: number;
    } | null;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
    if (!data) {
        return <div className="text-center p-8 text-gray-500">No hay datos para mostrar el gráfico.</div>;
    }

    const { studentSeries, expectedSeries, totalDays } = data;
    const width = 500;
    const height = 250;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };

    const xScale = (day: number) => {
        return padding.left + (day / totalDays) * (width - padding.left - padding.right);
    };

    const yScale = (points: number) => {
        return height - padding.bottom - (points / TOTAL_MAX_POINTS) * (height - padding.top - padding.bottom);
    };

    const studentPath = studentSeries.map(p => `${xScale(p.day)},${yScale(p.points)}`).join(' ');
    const expectedPath = expectedSeries.map(p => `${xScale(p.day)},${yScale(p.points)}`).join(' ');

    const yAxisTicks = [0, 0.25, 0.5, 0.75, 1.0].map(multiple => multiple * TOTAL_MAX_POINTS);

    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-labelledby="chart-title">
                <title id="chart-title">Gráfico de progreso de puntos</title>
                {/* Y-Axis */}
                <g className="text-xs text-gray-400">
                    {yAxisTicks.map(points => (
                        <g key={points}>
                            <line
                                x1={padding.left}
                                x2={width - padding.right}
                                y1={yScale(points)}
                                y2={yScale(points)}
                                stroke="currentColor"
                                strokeDasharray="2,3"
                                className="text-gray-200"
                            />
                            <text x={padding.left - 8} y={yScale(points) + 4} textAnchor="end" fill="currentColor">
                                {points}
                            </text>
                        </g>
                    ))}
                    <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="currentColor" className="text-gray-300" />
                </g>

                {/* X-Axis */}
                <g className="text-xs text-gray-400">
                     <line x1={padding.left} y1={height-padding.bottom} x2={width - padding.right} y2={height-padding.bottom} stroke="currentColor" className="text-gray-300" />
                     {[0, 0.25, 0.5, 0.75, 1.0].map(multiple => {
                         const day = Math.round(multiple * totalDays);
                         return (
                            <text key={day} x={xScale(day)} y={height - padding.bottom + 16} textAnchor="middle" fill="currentColor">
                                Día {day}
                            </text>
                         )
                     })}
                </g>

                {/* Data lines */}
                <polyline
                    fill="none"
                    stroke="#4f46e5" // indigo-600
                    strokeWidth="2.5"
                    points={studentPath}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                 <polyline
                    fill="none"
                    stroke="#9ca3af" // gray-400
                    strokeWidth="2.5"
                    strokeDasharray="4, 4"
                    points={expectedPath}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Current day marker */}
                {studentSeries.length > 0 && (
                     <circle cx={xScale(studentSeries[studentSeries.length-1].day)} cy={yScale(studentSeries[studentSeries.length-1].points)} r="4" fill="#4f46e5" stroke="white" strokeWidth="2" />
                )}

            </svg>
            <div className="flex justify-center items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                    <span className="text-gray-600">Progreso de la Estudiante</span>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-1 border-t-2 border-gray-400 border-dashed"></div>
                    <span className="text-gray-600">Progreso Esperado</span>
                </div>
            </div>
        </div>
    );
};

export default ProgressChart;