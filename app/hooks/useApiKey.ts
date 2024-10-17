import { useState, useEffect } from 'react';
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

    useEffect(() => {
        if (!shop || !carrierName) return;

        fetcher.submit(
            { shop, carrierName },
            { method: 'post', action: '/api/get-api-key' }
        );
    }, [shop, carrierName, fetcher]);

    useEffect(() => {
        if (fetcher.data) {
            setApiKey(fetcher.data.apiKey || '');
            setIsLoading(false);
            if (fetcher.data.error) {
                setError(fetcher.data.error);
            }
        }
    }, [fetcher.data]);

    return { apiKey, setApiKey, isLoading, error };
}
