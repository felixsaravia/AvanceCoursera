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

  const sizedIcon = React.isValidElement(config.icon)
    ? React.cloneElement(config.icon as React.ReactElement<any>, {
        className: 'w-3.5 h-3.5',
      })
    : null;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.textColor}`}>
      {sizedIcon}
      <span>{status}</span>
    </div>
  );
};

export default StatusBadge;
