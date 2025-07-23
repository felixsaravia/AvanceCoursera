import React, { useState, useEffect, useRef, useCallback } from 'react';

const WORK_MINS = 25;
const SHORT_BREAK_MINS = 5;
const LONG_BREAK_MINS = 15;

const PomodoroTimer: React.FC = () => {
    const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
    const [time, setTime] = useState(WORK_MINS * 60);
    const [isActive, setIsActive] = useState(false);
    const [cycles, setCycles] = useState(0);

    const notificationSound = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Preload sound
        notificationSound.current = new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3');
        notificationSound.current.volume = 0.5;
    }, []);

    const switchMode = useCallback(() => {
        setIsActive(false);
        notificationSound.current?.play().catch(e => console.error("Error playing sound:", e));
        if (mode === 'work') {
            const newCycles = cycles + 1;
            setCycles(newCycles);
            if (newCycles % 4 === 0) {
                setMode('longBreak');
                setTime(LONG_BREAK_MINS * 60);
            } else {
                setMode('shortBreak');
                setTime(SHORT_BREAK_MINS * 60);
            }
        } else {
            setMode('work');
            setTime(WORK_MINS * 60);
        }
    }, [mode, cycles]);

    useEffect(() => {
        let interval: number | null = null;
        if (isActive && time > 0) {
            interval = window.setInterval(() => {
                setTime(t => t - 1);
            }, 1000);
        } else if (isActive && time === 0) {
            switchMode();
        }
        return () => {
            if (interval) window.clearInterval(interval);
        };
    }, [isActive, time, switchMode]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        if (mode === 'work') setTime(WORK_MINS * 60);
        else if (mode === 'shortBreak') setTime(SHORT_BREAK_MINS * 60);
        else setTime(LONG_BREAK_MINS * 60);
    };
    
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    const modeText = {
        work: 'Enfoque',
        shortBreak: 'Descanso Corto',
        longBreak: 'Descanso Largo'
    };
    
    const progress = (mode === 'work' ? (WORK_MINS * 60 - time) / (WORK_MINS * 60) :
                     mode === 'shortBreak' ? (SHORT_BREAK_MINS * 60 - time) / (SHORT_BREAK_MINS * 60) :
                     (LONG_BREAK_MINS * 60 - time) / (LONG_BREAK_MINS * 60)) * 100;


    return (
        <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center gap-6">
            <div className="text-center">
                <p className="text-lg font-semibold text-sky-600">{modeText[mode]}</p>
                <p className="text-8xl font-bold text-gray-900 tracking-tighter my-4">
                    {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-sky-500 h-2 rounded-full" style={{width: `${progress}%`}}></div>
            </div>
            <div className="flex gap-4">
                <button
                    onClick={toggleTimer}
                    className="w-32 py-3 px-4 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors"
                >
                    {isActive ? 'Pausar' : 'Iniciar'}
                </button>
                <button
                    onClick={resetTimer}
                    className="w-32 py-3 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Reiniciar
                </button>
            </div>
            <p className="text-gray-500 text-sm">Ciclos de enfoque completados: <span className="font-bold text-gray-900">{cycles}</span></p>
        </div>
    );
};

export default PomodoroTimer;