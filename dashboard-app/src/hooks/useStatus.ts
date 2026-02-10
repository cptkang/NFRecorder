import { useState, useEffect } from 'react';

import { StatusData } from '@/lib/storage';

export interface StatusDataWithServerTime extends StatusData {
    serverTime?: string;
}

export function useStatus(pollingInterval = 5000) {
    const [data, setData] = useState<StatusDataWithServerTime | null>(null);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/status');
            if (!res.ok) throw new Error('Failed to fetch status');
            const json = await res.json();

            if (json.serverTime) {
                const serverTime = new Date(json.serverTime).getTime();
                const clientTime = Date.now();
                setOffset(serverTime - clientTime);
            }

            setData(json);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, pollingInterval);
        return () => clearInterval(interval);
    }, [pollingInterval]);

    return { data, loading, offset, mutate: fetchData };
}
