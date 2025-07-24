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
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
      {orderedStatuses.map(status => {
        const config = STATUS_CONFIG[status];
        const count = statusCounts[status] || 0;
        
        if (!config) return null;

        return (
          <div key={status} className={`p-3 rounded-lg shadow-sm ${config.color}`}>
            <div className="flex justify-between items-start">
              <span className={`font-semibold text-sm ${config.textColor}`}>{status}</span>
              <span className={`w-5 h-5 ${config.textColor}`}>
                  {React.isValidElement(config.icon) ? React.cloneElement(config.icon, Object.assign({}, config.icon.props, { strokeWidth: '2.5' })) : null}
              </span>
            </div>
            <p className={`text-4xl font-bold mt-2 ${config.textColor}`}>{count}</p>
          </div>
        );
      })}
    </div>
  );
};

export default StatusSummary;