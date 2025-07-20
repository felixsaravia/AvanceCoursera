import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full bg-slate-700 rounded-full h-2.5">
      <div
        className="bg-gradient-to-r from-sky-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${safeProgress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
