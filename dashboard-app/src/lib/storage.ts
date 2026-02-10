import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'status.json');

export interface StatusData {
    startTime: string; // Zero Point
    targetDays: number;
    targetDate?: string; // Goal Date (Calculated from Start + Days)
    status: 'normal' | 'warning' | 'critical';
    serviceName: string; // Dashboard Title
    lastFailure: {
        date: string | null;
        reason: string;
    };
    bestRecord: {
        durationMs: number;
        achievedDate: string;
    };
    history: Array<{
        date: string;
        durationMs: number;
        reason: string;
    }>;
}

const DEFAULT_DATA: StatusData = {
    startTime: new Date().toISOString(),
    targetDays: 100,
    targetDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'normal',
    serviceName: '테크그룹 인프라본부 무장애 대시보드',
    lastFailure: { date: null, reason: '' },
    bestRecord: { durationMs: 0, achievedDate: new Date().toISOString() },
    history: []
};

export async function getStatus(): Promise<StatusData> {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return { ...DEFAULT_DATA, ...JSON.parse(data) };
    } catch (error) {
        return DEFAULT_DATA;
    }
}

export async function saveStatus(data: StatusData): Promise<void> {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Deprecated separate functions, mapped to single file for compatibility during transition if needed
// forcing them to use getStatus/saveStatus internally logic if keeping signatures, 
// but easier to just revert to single getStatus/saveStatus as per requirement "integrated file".
// I will remove the split functions to enforce single source of truth.
