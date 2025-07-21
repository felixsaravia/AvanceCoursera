import React from 'react';

interface VerificationStatusBadgeProps {
  verified: boolean;
  onClick: () => void;
  verifiedText?: string;
  pendingText?: string;
  disabled?: boolean;
}

const VerificationStatusBadge: React.FC<VerificationStatusBadgeProps> = ({ 
  verified, 
  onClick, 
  verifiedText = 'Realizado', 
  pendingText = 'Pendiente',
  disabled = false
}) => {
  const baseClasses = "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors w-40 justify-center";
  
  const stateClasses = verified 
    ? "bg-green-500/20 text-green-400" 
    : "bg-amber-500/20 text-amber-400";
    
  const interactiveClasses = !disabled
    ? (verified ? "hover:bg-green-500/30" : "hover:bg-amber-500/30")
    : "opacity-60 cursor-not-allowed";
  
  const icon = verified ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseClasses} ${stateClasses} ${interactiveClasses}`} 
      aria-label={`Estado: ${verified ? verifiedText : pendingText}. Click para cambiar.`}
    >
      {icon}
      <span>{verified ? verifiedText : pendingText}</span>
    </button>
  );
};

export default VerificationStatusBadge;