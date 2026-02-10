'use client';

import { useState, useEffect } from 'react';
import { useStatus } from '@/hooks/useStatus';
import styles from '@/styles/Admin.module.css';

export default function AdminDashboard() {
    const { data, loading, mutate } = useStatus();
    const [form, setForm] = useState<any>({});
    const [saving, setSaving] = useState(false);

    // Helper to format Date for input type="datetime-local" (YYYY-MM-DDTHH:mm)
    const toLocalISOString = (dateStr: string) => {
        const date = new Date(dateStr);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (data && !initialized) {
            const start = new Date(data.startTime);
            const targetDays = Number(data.targetDays);
            const targetDate = new Date(start.getTime() + targetDays * 24 * 60 * 60 * 1000);

            setForm({
                ...data,
                startTimeISO: toLocalISOString(data.startTime),
                lastFailureISO: data.lastFailure?.date ? toLocalISOString(data.lastFailure.date) : '',
                targetDate: targetDate.toISOString().split('T')[0] // YYYY-MM-DD
            });
            setInitialized(true);
        }
    }, [data, initialized]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev: any) => ({ ...prev, [name]: value }));
    };

    // Linked Logic Handlers
    // Anchor: Target Date (Goal Date).
    // Formula: TargetDate = StartDate + Days.

    // 1. Change Target Days -> Update TargetDate(Keep Start/Failure Date constant)
    // 1. Change Target Days -> Update Target Date (Keep Start/Failure constant)
    const handleTargetDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const days = Number(e.target.value);
        setForm((prev: any) => {
            // Anchor is Start Time
            // Use startTimeISO (if edited) or fallback to data.startTime
            const start = new Date(prev.startTimeISO || prev.startTime || new Date());
            const targetDate = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);

            return {
                ...prev,
                targetDays: days,
                targetDate: targetDate.toISOString().split('T')[0] // Update Target Date YYYY-MM-DD
            };
        });
    };

    // 2. Change Target Date -> Update Target Days (Keep Start/Failure constant)
    const handleTargetDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateStr = e.target.value;
        setForm((prev: any) => {
            const targetDate = new Date(dateStr);
            const start = new Date(prev.startTimeISO || new Date());

            const diffMs = targetDate.getTime() - start.getTime();
            const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            return {
                ...prev,
                targetDate: dateStr,
                targetDays: days > 0 ? days : 0
            };
        });
    };

    // 3. Change Start Date (or Last Failure) -> Update Target Days (Keep TargetDate constant)
    // We need to override the generic handleChange for date inputs to support this if we want full 3-way.
    // User said: "Modify Target Goal -> Modify Last Failure" (Done)
    // "Vice Versa" -> "Modify Last Failure -> Modify Target Goal" (Need to implement).

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev: any) => {
            // 1. Last Failure Date: Independent (Does not affect Target Days or Start Time)
            if (name === 'lastFailureISO') {
                return { ...prev, [name]: value };
            }

            // 2. Start Time: Affects Target Days (if Target Date exists)
            if (name === 'startTimeISO' && prev.targetDate) {
                const newStart = new Date(value);
                const targetDate = new Date(prev.targetDate);

                const diffMs = targetDate.getTime() - newStart.getTime();
                const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                return {
                    ...prev,
                    [name]: value,
                    targetDays: days > 0 ? days : 0
                };
            }

            return { ...prev, [name]: value };
        });
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            // Need to convert local datetime-local back to ISO if changed
            // But startTime is critical.
            // If user edits startTimeISO, we update startTime.
            const payload = { ...form };
            if (form.startTimeISO) {
                payload.startTime = new Date(form.startTimeISO).toISOString();
            }
            // Handle lastFailureISO (allow null if cleared)
            if (typeof form.lastFailureISO === 'string') {
                payload.lastFailure = {
                    ...(payload.lastFailure || {}),
                    date: form.lastFailureISO ? new Date(form.lastFailureISO).toISOString() : null
                };
            }
            delete payload.startTimeISO;
            delete payload.lastFailureISO;

            await fetch('/api/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            await mutate();
            alert('Settings Saved');
        } catch (e) {
            alert('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        const reason = prompt("Enter failure reason (optional):");
        if (reason === null) return; // Cancelled

        if (!confirm('Are you sure you want to RESET the counter and archive current run?')) return;

        setSaving(true);
        try {
            await fetch('/api/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            await mutate();
            alert('Reset Successful');
        } catch (e) {
            alert('Error resetting');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !initialized) return <div className={styles.container}>Loading...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Admin Console</h1>
                <button className={`${styles.button} ${styles.saveButton}`} onClick={saveSettings} disabled={saving}>
                    {saving ? 'Saving...' : 'SAVE SETTINGS'}
                </button>
            </header>

            {/* Status Control */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Status Control</h2>
                <div className={styles.statusContainer}>
                    {['normal', 'warning', 'critical'].map((s) => (
                        <label key={s} className={styles.radioLabel}>
                            <input
                                type="radio"
                                name="status"
                                value={s}
                                checked={form.status === s}
                                onChange={handleChange}
                            />
                            {s.toUpperCase()}
                        </label>
                    ))}
                </div>
                <p className={styles.label} style={{ marginTop: '1rem' }}>
                    Setting CRITICAL will change dashboard to Red theme.
                </p>
            </section>

            {/* Time Management */}
            {/* Time Management */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Time Management</h2>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Start Date <small>(Counter Zero Point)</small></label>
                    <input
                        type="datetime-local"
                        name="startTimeISO"
                        value={form.startTimeISO || ''}
                        onChange={handleDateChange}
                        className={styles.input}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Last Failure Date <small>(Footer Display)</small></label>
                    <input
                        type="datetime-local"
                        name="lastFailureISO"
                        value={form.lastFailureISO || ''}
                        onChange={handleDateChange}
                        className={styles.input}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Target Goal (Days)</label>
                    <input
                        type="number"
                        name="targetDays"
                        value={form.targetDays}
                        onChange={handleTargetDaysChange}
                        className={styles.input}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Target Date <small>(Goal Achievement Date)</small></label>
                    <input
                        type="date"
                        name="targetDate"
                        value={form.targetDate || ''}
                        onChange={handleTargetDateChange}
                        className={styles.input}
                    />
                </div>
            </section>

            {/* Text Management */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Text Management</h2>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Dashboard Title</label>
                    <input
                        type="text"
                        name="serviceName"
                        value={form.serviceName}
                        onChange={handleChange}
                        className={styles.input}
                    />
                </div>
            </section>


            <div style={{ height: '3rem' }}></div>

            {/* Reset Control */}
            <section className={styles.section} style={{ borderColor: '#FF3333' }}>
                <h2 className={styles.sectionTitle} style={{ color: '#FF3333' }}>Danger Zone</h2>
                <p className={styles.label}>
                    Clicking Reset will:
                    1. Archive current run to history.
                    2. Update Best Record if beat.
                    3. Set Start Time to NOW.
                    4. Set Status to CRITICAL.
                </p>
                <button className={`${styles.button} ${styles.resetButton}`} onClick={handleReset} disabled={saving}>
                    RESET COUNTER (FAILURE OCCURRED)
                </button>
            </section>

            {/* History */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Recent History</h2>
                <ul className={styles.historyList}>
                    {data?.history?.map((item: any, i: number) => (
                        <li key={i} className={styles.historyItem}>
                            <span>{new Date(item.date).toLocaleDateString()}</span>
                            <span>{Math.floor(item.durationMs / (1000 * 60 * 60))} Hours</span>
                            <span>{item.reason}</span>
                        </li>
                    ))}
                    {!data?.history?.length && <li className={styles.historyItem}>No history yet.</li>}
                </ul>
            </section>
        </div>
    );
}
