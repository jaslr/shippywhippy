import { useState, useEffect, useRef } from 'react';
import { useFetcher } from '@remix-run/react';

type ApiKeyResponse = {
    apiKey?: string;
    error?: string;
};

export function useApiKey(shop: string, carrierName: string) {
    const [apiKey, setApiKey] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetcher = useFetcher<ApiKeyResponse>();
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (!shop || !carrierName || hasFetchedRef.current) return;

        if (fetcher.state === 'idle' && !fetcher.data) {
            hasFetchedRef.current = true;
            fetcher.submit(
                { shop, carrierName },
                { method: 'post', action: '/api/get-api-key' }
            );
        }
    }, [shop, carrierName, fetcher]);

    useEffect(() => {
        if (fetcher.data) {
            setApiKey(fetcher.data.apiKey || '');
            setIsLoading(false);
            setError(fetcher.data.error || null);
        }
    }, [fetcher.data]);

    return { apiKey, setApiKey, isLoading, error };
}
