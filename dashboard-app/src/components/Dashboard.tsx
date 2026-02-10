'use client';

import styles from '@/styles/Dashboard.module.css';
import { useEffect, useState } from 'react';
import { useStatus } from '@/hooks/useStatus';
import KBLogo from './KBLogo';
import { Orbitron } from 'next/font/google';

const digitalFont = Orbitron({ subsets: ['latin'], weight: '700' });

function formatDuration(ms: number) {
    if (ms < 0) ms = 0;
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    return {
        days: days.toString().padStart(3, '0'),
        time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    };
}

export default function Dashboard() {
    const { data, loading, offset } = useStatus(5000);
    const [elapsed, setElapsed] = useState(0);
    const [currentTime, setCurrentTime] = useState<string>('');

    useEffect(() => {
        if (!data) return;

        const tick = () => {
            const nowMs = Date.now() + offset;
            const now = new Date(nowMs);

            // Update Elapsed
            const start = new Date(data.startTime).getTime();
            let currentElapsed = nowMs - start;

            if (data.status === 'critical' && data.lastFailure?.date) {
                const failureTime = new Date(data.lastFailure.date).getTime();
                currentElapsed = failureTime - start;
            }

            setElapsed(currentElapsed > 0 ? currentElapsed : 0);

            // Update Current Time String (HH:MM:SS)
            const h = now.getHours().toString().padStart(2, '0');
            const m = now.getMinutes().toString().padStart(2, '0');
            const s = now.getSeconds().toString().padStart(2, '0');
            setCurrentTime(`${h}:${m}:${s}`);
        };

        const interval = setInterval(tick, 100); // 100ms for smooth clock
        tick();
        return () => clearInterval(interval);
    }, [data, offset]);

    if (loading || !data) return <div className={styles.container}>Loading...</div>;

    const { days, time } = formatDuration(elapsed);
    const targetMs = data.targetDays * 24 * 60 * 60 * 1000;
    const progress = Math.min((elapsed / targetMs) * 100, 100);
    const remainingMs = targetMs - elapsed;
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

    // Dates
    const startDate = new Date(data.startTime);
    const currentDate = new Date(Date.now() + offset);

    // Format YYYY.MM.DD
    const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        return `${y}.${m}.${d}`;
    };

    return (
        <main className={styles.container}>
            <div className={`${styles.mainWrapper} ${styles.glassPanel}`}>

                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.branding}>
                        <img src="/images/kb_logo.jpg" alt="KB Kookmin Bank" style={{ height: '50px', objectFit: 'contain' }} />
                    </div>
                    <h1 className={styles.pageTitle}>{data.serviceName}</h1>
                    <div className={styles.statusContainer}>
                        <div className={`${styles.statusLed} ${styles[data.status]}`}></div>
                        <span className={styles.statusLabel}>현재 상태</span>
                    </div>
                </header>

                {/* Main Counter */}
                <div className={styles.displayPanel}>
                    <div className={styles.counterLabel}>무장애 누적 일수</div>
                    <div className={`${styles.counterValue} ${digitalFont.className}`}>
                        {days} <span className={styles.daysUnit}>DAYS</span> {time}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className={styles.progressSection}>
                    {/* Digital Clock */}
                    <div style={{ width: '100%', textAlign: 'center' }}>
                        <div className={`${styles.digitalClock} ${digitalFont.className}`}>{currentTime}</div>
                    </div>

                    <div className={styles.progressHeader}>
                        <span>목표 달성률</span>
                        <span>{remainingDays > 0 ? `D-${remainingDays}` : '목표 달성'} ({progress.toFixed(0)}%)</span>
                    </div>
                    <div className={styles.progressBarTrack}>
                        <div
                            className={styles.progressBarFill}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className={styles.progressStats}>
                        <div className={styles.statLabel}>
                            목표시간: <span className={`${styles.statValue} ${digitalFont.className}`}>{data.targetDays} DAYS</span>
                            {data.targetDate && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#888' }}>({data.targetDate})</span>}
                        </div>
                        <div className={styles.statLabel} style={{ textAlign: 'right' }}>
                            달성시간: <span className={`${styles.statValue} ${digitalFont.className}`} style={{ color: '#ff5f1f' }}>{Math.floor(elapsed / (1000 * 60 * 60 * 24))} DAYS</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className={styles.footer}>
                    <div className={styles.footerItem}>
                        <span className={styles.footerLabel}>개시일</span>
                        <span className={styles.footerValue}>{formatDate(startDate)}</span>
                    </div>
                    <div className={styles.footerItem}>
                        <span className={styles.footerLabel}>현재날짜</span>
                        <span className={styles.footerValue}>{formatDate(currentDate)}</span>
                    </div>
                    <div className={styles.footerItem}>
                        <span className={styles.footerLabel}>직전 장애일</span>
                        <span className={styles.footerValue}>
                            {data.lastFailure?.date ? formatDate(new Date(data.lastFailure.date)) : '-'}
                        </span>
                    </div>
                </footer>

            </div>
        </main>
    );
}
