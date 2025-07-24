import React from 'react';
import { ActiveView } from '../App';

interface BottomNavProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const NavButton = ({ Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-sky-600' : 'text-gray-500 hover:text-gray-900'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    <Icon className="w-6 h-6 mb-1" />
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const MonitorIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8a2 2 0 0 1 0 2.8l-6 6-4-4-4 4"/></svg>
);

const ScheduleIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

const VerificationIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

const CertificateIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
);

const ToolsIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4z"/></svg>
);

const HelpIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 shadow-t-lg z-50">
      <div className="flex justify-around max-w-xl mx-auto">
        <NavButton
          Icon={MonitorIcon}
          label="Monitor"
          isActive={activeView === 'monitor'}
          onClick={() => setActiveView('monitor')}
        />
        <NavButton
          Icon={ScheduleIcon}
          label="Cronograma"
          isActive={activeView === 'schedule'}
          onClick={() => setActiveView('schedule')}
        />
        <NavButton
          Icon={VerificationIcon}
          label="Verificar"
          isActive={activeView === 'verification'}
          onClick={() => setActiveView('verification')}
        />
        <NavButton
          Icon={CertificateIcon}
          label="Certs"
          isActive={activeView === 'certificates'}
          onClick={() => setActiveView('certificates')}
        />
        <NavButton
          Icon={ToolsIcon}
          label="Tools"
          isActive={activeView === 'tools'}
          onClick={() => setActiveView('tools')}
        />
        <NavButton
          Icon={HelpIcon}
          label="Ayuda"
          isActive={activeView === 'help'}
          onClick={() => setActiveView('help')}
        />
      </div>
    </nav>
  );
};

export default BottomNav;