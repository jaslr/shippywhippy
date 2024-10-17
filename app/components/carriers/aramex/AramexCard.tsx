import React, { useState, useCallback } from 'react';
import { Card, BlockStack, Text, TextField, FormLayout, Button, Banner, Link, InlineStack } from '@shopify/polaris';
import { useFetcher } from '@remix-run/react';

// Define constants here if the constants file is not set up
const ARAMEX_NAME = 'Aramex';
const ARAMEX_API_KEY = process.env.ARAMEX_API_KEY || 'your-default-api-key';

type AramexLookupData = {
    success: boolean;
    error?: string;
    data?: any;
};

export function AramexCard() {
    const [isEnabled, setIsEnabled] = useState(false);
    const fetcher = useFetcher<AramexLookupData>();

    const testUrl = '/api/aramex-lookup';

    const handleToggle = useCallback(() => {
        setIsEnabled((enabled) => !enabled);
    }, []);

    const performLookup = () => {
        fetcher.submit(
            { apiKey: ARAMEX_API_KEY, checkType: 'uptime' },
            { method: 'post', action: testUrl }
        );
    };

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
                        value={ARAMEX_API_KEY}
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
                            <p>API Key used: {ARAMEX_API_KEY}</p>
                            <p>Please check your API key and try again. If the problem persists, contact Aramex support or refer to the <Link url="https://www.aramex.com/developers/apis" external>API documentation</Link>.</p>
                        </Banner>
                    )}
                    {fetcher.data && 'success' in fetcher.data && fetcher.data.success && (
                        <Banner tone="success" title="API Connection Successful">
                            <p>API Key used: {ARAMEX_API_KEY}</p>
                            <p>API URL: {testUrl}</p>
                            <pre>{JSON.stringify(fetcher.data.data, null, 2)}</pre>
                        </Banner>
                    )}
                </FormLayout>
            </BlockStack>
        </Card>
    );
}
