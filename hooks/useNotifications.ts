import { useState, useEffect, useCallback } from 'react';

export type NotificationPermission = 'default' | 'granted' | 'denied';

export const useNotifications = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');

    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            console.error('Este navegador no soporta notificaciones de escritorio.');
            return;
        }
        const status = await Notification.requestPermission();
        setPermission(status);
    }, []);

    const sendNotification = useCallback((title: string, body: string, options?: NotificationOptions) => {
        if (permission === 'granted') {
            const notification = new Notification(title, {
                ...options,
                body,
                icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎓</text></svg>',
                badge: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎓</text></svg>',
            });
            return notification;
        }
    }, [permission]);

    return { permission, requestPermission, sendNotification };
};
