import React, { useState, useCallback } from 'react';
import { Card, BlockStack, Text, TextField, FormLayout, Button, Banner, Link, InlineStack } from '@shopify/polaris';
import { useFetcher } from '@remix-run/react';
import { updateCarrierStatus } from '../../../libs/carriers/utils/carrierHelpers';
import { getCarrierByName } from '../../../libs/carriers/carrierlist';
import { useApiKey } from '../../../hooks/useApiKey';

const ARAMEX_NAME = 'Aramex';
const aramexConfig = getCarrierByName(ARAMEX_NAME);

type AramexLookupData = {
    success: boolean;
    error?: string;
    data?: any;
};

export function AramexCard({ shop }: { shop: string }) {
    const [isEnabled, setIsEnabled] = useState(false);
    const { apiKey, setApiKey, isLoading, error } = useApiKey(shop, ARAMEX_NAME);
    const fetcher = useFetcher<AramexLookupData>();

    const testUrl = '/api/aramex-lookup';

    const handleToggle = useCallback(async () => {
        const newStatus = !isEnabled;
        setIsEnabled(newStatus);
        try {
            await updateCarrierStatus(shop, ARAMEX_NAME, newStatus);
        } catch (error) {
            console.error('Failed to update Aramex status:', error);
            setIsEnabled(!newStatus);
        }
    }, [isEnabled, shop]);

    const performLookup = useCallback(() => {
        if (apiKey) {
            fetcher.submit(
                { apiKey, checkType: 'uptime' },
                { method: 'post', action: testUrl }
            );
        }
    }, [apiKey, fetcher, testUrl]);

    const toggleButtonText = isEnabled ? 'Disable' : 'Enable';

    // Rest of the component remains the same
}
