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
      isActive ? 'text-sky-400' : 'text-slate-400 hover:text-white'
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

const ConfigIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);


const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-slate-800/80 backdrop-blur-sm border-t border-slate-700 shadow-t-lg z-50">
      <div className="flex justify-around max-w-xl mx-auto">
        <NavButton
          Icon={MonitorIcon}
          label="Monitor"
          isActive={activeView === 'monitor'}
          onClick={() => setActiveView('monitor')}
        />
        <NavButton
          Icon={VerificationIcon}
          label="Verificación"
          isActive={activeView === 'verification'}
          onClick={() => setActiveView('verification')}
        />
        <NavButton
          Icon={CertificateIcon}
          label="Certificados"
          isActive={activeView === 'certificates'}
          onClick={() => setActiveView('certificates')}
        />
        <NavButton
          Icon={ToolsIcon}
          label="Herramientas"
          isActive={activeView === 'tools'}
          onClick={() => setActiveView('tools')}
        />
        <NavButton
          Icon={HelpIcon}
          label="Ayuda"
          isActive={activeView === 'help'}
          onClick={() => setActiveView('help')}
        />
        <NavButton
          Icon={ConfigIcon}
          label="Config"
          isActive={activeView === 'config'}
          onClick={() => setActiveView('config')}
        />
      </div>
    </nav>
  );
};

export default BottomNav;