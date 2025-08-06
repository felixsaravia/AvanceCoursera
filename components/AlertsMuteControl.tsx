import React from 'react';

interface AlertsMuteControlProps {
  isMuted: boolean;
  onToggle: () => void;
}

const SpeakerIcon = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;
const MutedSpeakerIcon = <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>;

const AlertsMuteControl: React.FC<AlertsMuteControlProps> = ({ isMuted, onToggle }) => {
  const title = isMuted ? 'Activar alertas de la aplicación' : 'Silenciar alertas de la aplicación';
  return (
    <button
      onClick={onToggle}
      title={title}
      className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
      aria-label={title}
    >
      {isMuted ? MutedSpeakerIcon : SpeakerIcon}
    </button>
  );
};

export default AlertsMuteControl;
