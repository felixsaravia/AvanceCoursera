import React from 'react';
import { useNotifications, NotificationPermission } from '../hooks/useNotifications';

const ICONS: { [key in NotificationPermission]: { icon: React.ReactNode, title: string, classes: string } } = {
    granted: {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
        title: 'Las notificaciones están activadas',
        classes: 'text-green-600 hover:bg-green-100'
    },
    default: {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M2 2l20 20"/></svg>,
        title: 'Hacer clic para activar notificaciones',
        classes: 'text-gray-500 hover:bg-gray-100'
    },
    denied: {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M2 2l20 20"/></svg>,
        title: 'Notificaciones bloqueadas. Habilítalas en la configuración de tu navegador.',
        classes: 'text-red-500 bg-red-100 cursor-not-allowed'
    }
}

const NotificationBell: React.FC = () => {
    const { permission, requestPermission } = useNotifications();

    const handleClick = () => {
        if (permission === 'default') {
            requestPermission();
        }
    };

    const config = ICONS[permission];

    return (
        <button
            onClick={handleClick}
            title={config.title}
            disabled={permission === 'denied'}
            className={`p-2 rounded-full transition-colors ${config.classes}`}
            aria-label={config.title}
        >
            {config.icon}
        </button>
    );
};

export default NotificationBell;