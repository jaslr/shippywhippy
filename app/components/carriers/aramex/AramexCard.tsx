import React, { useState, useCallback, useEffect } from 'react';
import { Card, BlockStack, Text, TextField, FormLayout, Button, Banner, Link, InlineStack } from '@shopify/polaris';
import { useFetcher } from '@remix-run/react';
import { updateCarrierStatus } from '../../../libs/carriers/utils/carrierHelpers';
import { getCarrierByName } from '../../../libs/carriers/carrierlist';
import { getApiKey } from '../../../libs/carriers/utils/getApiKey';

const ARAMEX_NAME = 'Aramex';
const aramexConfig = getCarrierByName(ARAMEX_NAME);
const ARAMEX_API_KEY = aramexConfig?.apiKeyEnvVar ? process.env[aramexConfig.apiKeyEnvVar] : 'your-default-api-key';

type AramexLookupData = {
    success: boolean;
    error?: string;
    data?: any;
};

export function AramexCard({ shop }: { shop: string }) {
    const [isEnabled, setIsEnabled] = useState(false);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const fetcher = useFetcher<AramexLookupData>();

    const testUrl = '/api/aramex-lookup';

    useEffect(() => {
        async function fetchApiKey() {
            try {
                const key = await getApiKey(shop, ARAMEX_NAME);
                setApiKey(key);
            } catch (error) {
                console.error('Failed to fetch API key:', error);
            }
        }
        fetchApiKey();
    }, [shop]);

    const handleToggle = useCallback(async () => {
        const newStatus = !isEnabled;
        setIsEnabled(newStatus);
        try {
            await updateCarrierStatus(shop, ARAMEX_NAME, newStatus);
        } catch (error) {
            console.error('Failed to update Aramex status:', error);
            setIsEnabled(!newStatus); // Revert the state if update fails
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

    return (
        <Card>
            <BlockStack gap="400">
                <InlineStack align="space-between">
                    <Text as="h3" variant="headingMd">
                        {ARAMEX_NAME}
                    </Text>
                    <InlineStack gap="200">
                        <Button onClick={performLookup} disabled={!isEnabled} size="slim">
                            Test API Connection
                        </Button>
                        <Button
                            onClick={handleToggle}
                            pressed={isEnabled}
                            role="switch"
                            ariaChecked={isEnabled ? 'true' : 'false'}
                            size="slim"
                        >
                            {toggleButtonText}
                        </Button>
                    </InlineStack>
                </InlineStack>
                <FormLayout>
                    <TextField
                        label="API Key"
                        value={apiKey || ARAMEX_API_KEY}
                        readOnly
                        autoComplete="off"
                    />
                    <Text as="p" variant="bodyMd">
                        This carrier is {isEnabled ? 'enabled' : 'disabled'}
                    </Text>
                    <Text as="p" variant="bodyMd">
                        This test will attempt to calculate shipping for a standard parcel from Dubai to Riyadh.
                    </Text>
                    {fetcher.data && 'success' in fetcher.data && !fetcher.data.success && (
                        <Banner tone="critical">
                            <p>Error: {fetcher.data.error || 'An unknown error occurred'}</p>
                            <p>API Key used: {apiKey || ARAMEX_API_KEY}</p>
                            <p>Please check your API key and try again. If the problem persists, contact Aramex support or refer to the <Link url="https://www.aramex.com/developers/apis" external>API documentation</Link>.</p>
                        </Banner>
                    )}
                    {fetcher.data && 'success' in fetcher.data && fetcher.data.success && (
                        <Banner tone="success" title="API Connection Successful">
                            <p>API Key used: {apiKey || ARAMEX_API_KEY}</p>
                            <p>API URL: {testUrl}</p>
                            <pre>{JSON.stringify(fetcher.data.data, null, 2)}</pre>
                        </Banner>
                    )}
                </FormLayout>
            </BlockStack>
        </Card>
    );
}
