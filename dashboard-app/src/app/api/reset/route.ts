import { NextResponse } from 'next/server';
import { getStatus, saveStatus } from '@/lib/storage';

export async function POST(request: Request) {
    const body = await request.json();
    const reason = body.reason || 'Manual Reset';

    const current = await getStatus();
    const now = new Date();

    // Calculate duration based on START TIME (Zero Point)
    const startTime = new Date(current.startTime);
    const durationMs = now.getTime() - startTime.getTime();

    // Update History
    const newHistory = [
        {
            date: now.toISOString(),
            durationMs,
            reason
        },
        ...current.history
    ].slice(0, 50);

    // Check Best Record
    let bestRecord = current.bestRecord;
    if (durationMs > bestRecord.durationMs) {
        bestRecord = {
            durationMs,
            achievedDate: now.toISOString()
        };
    }

    // Reset Logic:
    const updated: import('@/lib/storage').StatusData = {
        ...current,
        status: 'critical',
        startTime: now.toISOString(),
        lastFailure: {
            date: now.toISOString(),
            reason
        },
        history: newHistory,
        bestRecord
    };

    await saveStatus(updated);

    return NextResponse.json({ success: true });
}
