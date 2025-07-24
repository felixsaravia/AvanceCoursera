import React from 'react';
import { Student, Status } from '../types';
import { STATUS_CONFIG, orderedStatuses } from '../constants';

interface StatusSummaryProps {
  students: Student[];
}

const StatusSummary: React.FC<StatusSummaryProps> = ({ students }) => {
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

        return (
          <div key={status} className={`p-2 sm:p-3 rounded-lg shadow-sm ${config.color}`}>
            <div className="flex justify-between items-start">
              <span className={`font-semibold text-xs sm:text-sm ${config.textColor}`}>{status}</span>
              {sizedIcon}
            </div>
            <p className={`text-3xl sm:text-4xl font-bold mt-1 sm:mt-2 ${config.textColor}`}>{count}</p>
          </div>
        );
      })}
    </div>
  );
};

export default StatusSummary;
