import React from 'react';
import { Status } from '../types';
import { STATUS_CONFIG } from '../constants';

interface StatusBadgeProps {
  status: Status;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status];

  if (!config) {
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color} ${config.textColor}`}>
      <span className="w-4 h-4">{config.icon}</span>
      <span>{status}</span>
    </div>
  );
};

export default StatusBadge;
