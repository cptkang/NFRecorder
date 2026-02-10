import { NextResponse } from 'next/server';
import { getStatus, saveStatus } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
    const data = await getStatus();
    return NextResponse.json({
        ...data,
        serverTime: new Date().toISOString()
    });
}

export async function POST(request: Request) {
    const body = await request.json();
    const current = await getStatus();

    // Merge updates
    const updated = { ...current, ...body };

    // Explicitly handle nested objects if partial updates are sent?
    // body usually sends full object or specific fields.
    // Ensure nested objects like lastFailure are merged correctly if partial.
    if (body.lastFailure) {
        updated.lastFailure = { ...current.lastFailure, ...body.lastFailure };
    }

    await saveStatus(updated);

    return NextResponse.json({ success: true });
}
