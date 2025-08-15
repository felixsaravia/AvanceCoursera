import React from 'react';
import { Student, Status } from '../types';
import { STATUS_CONFIG, orderedStatuses } from '../constants';

interface StatusSummaryProps {
  students: Student[];
  expectedPointsToday: number;
}

const StatusSummary: React.FC<StatusSummaryProps> = ({ students, expectedPointsToday }) => {
  const statusCounts = React.useMemo(() => {
    const counts = students.reduce((acc, student) => {
      const status = student.status || Status.SinIniciar;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as { [key in Status]?: number });

    // Ensure all statuses have a count, even if it's 0
    orderedStatuses.forEach(status => {
        if (counts[status] === undefined) {
            counts[status] = 0;
        }
    });

    return counts;
  }, [students]);

  const getStatusScoreRange = (status: Status): string => {
    const E = Math.round(expectedPointsToday);

    const format = (lower: number, upper: number) => {
        if (lower > upper || upper < 1) return ""; 

        const lowerBound = Math.max(1, lower);
        const upperBound = Math.min(599, upper);

        if (lowerBound > upperBound) return "";
        
        if (lowerBound === upperBound) return `${lowerBound} pts`;
        return `${lowerBound}-${upperBound} pts`;
    };

    switch (status) {
        case Status.Finalizada:
            return `600 pts`;
        case Status.SinIniciar:
            return `0 pts`;
        case Status.EliteII: {
            const lower = E + 151;
            if (lower > 599) return "";
            return `> ${E + 150} pts`;
        }
        case Status.EliteI:
            return format(E + 101, E + 150);
        case Status.Avanzada:
            return format(E + 1, E + 100);
        case Status.AlDia:
            return format(E - 25, E);
        case Status.Atrasada:
            return format(E - 75, E - 26);
        case Status.Riesgo: {
            const upper = E - 75;
            if (upper <= 1) return "";
            return `< ${upper} pts`;
        }
        default:
            return '';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4">
      {orderedStatuses.map(status => {
        const config = STATUS_CONFIG[status];
        const count = statusCounts[status] || 0;
        
        if (!config) return null;

        const sizedIcon = React.isValidElement(config.icon)
          ? React.cloneElement(config.icon as React.ReactElement<any>, {
              className: `w-4 h-4 sm:w-5 sm:h-5 ${config.textColor}`,
              strokeWidth: '2.5'
            })
          : null;
        
        const scoreRange = getStatusScoreRange(status);

        return (
          <div key={status} className={`p-2 sm:p-3 rounded-lg shadow-sm ${config.color} flex flex-col justify-between min-h-[95px] sm:min-h-[110px]`}>
            <div>
              <div className="flex justify-between items-start">
                <span className={`font-semibold text-xs sm:text-sm ${config.textColor}`}>{status}</span>
                {sizedIcon}
              </div>
              <p className={`text-3xl sm:text-4xl font-bold mt-1 sm:mt-2 ${config.textColor}`}>{count}</p>
            </div>
            {scoreRange && (
                <p className={`text-[10px] sm:text-xs text-right ${config.textColor} opacity-90 font-medium mt-1`}>
                    {scoreRange}
                </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatusSummary;