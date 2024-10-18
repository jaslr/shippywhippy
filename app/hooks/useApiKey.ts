import { useState, useEffect, useRef } from 'react';
import { useFetcher } from '@remix-run/react';

type ApiKeyResponse = {
    apiKey?: string;
    error?: string;
};

type AttemptLog = {
    attempt: number;
    result: string;
    timestamp: string;
};

export function useApiKey(shop: string, carrierName: string) {
    const [apiKey, setApiKey] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetcher = useFetcher<ApiKeyResponse>();
    const fetchAttempts = useRef(0);
    const attemptLogs = useRef<AttemptLog[]>([]);

    useEffect(() => {
        if (!shop || !carrierName) return;

        if (fetcher.state === 'idle' && !fetcher.data && fetchAttempts.current < 3) {
            fetchAttempts.current += 1;
            attemptLogs.current.push({
                attempt: fetchAttempts.current,
                result: 'Pending',
                timestamp: new Date().toISOString(),
            });
            fetcher.submit(
                { shop, carrierName },
                { method: 'post', action: '/api/get-api-key' }
            );
        } else if (fetchAttempts.current >= 3 && !apiKey) {
            setError('Failed to fetch API key after 3 attempts');
            setIsLoading(false);
        }
    }, [shop, carrierName, fetcher, apiKey]);

    useEffect(() => {
        if (fetcher.data) {
            const currentAttempt = attemptLogs.current[fetchAttempts.current - 1];
            if (fetcher.data.apiKey) {
                setApiKey(fetcher.data.apiKey);
                currentAttempt.result = 'Success';
            } else {
                currentAttempt.result = 'Failed';
                setApiKey(import.meta.env.VITE_DEFAULT_AUSTRALIA_POST_API_KEY || '');
            }
            setIsLoading(false);
            setError(fetcher.data.error || null);
            fetchAttempts.current = 0;
            attemptLogs.current = [];
        }
    }, [fetcher.data]);

    return { apiKey, setApiKey, isLoading, error };
}
