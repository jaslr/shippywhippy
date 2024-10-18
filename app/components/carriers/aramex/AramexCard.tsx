import React, { useState, useCallback, useEffect } from 'react';
import { Card, BlockStack, Text, TextField, FormLayout, Button, Banner, Link, InlineStack, Spinner } from '@shopify/polaris';
import { useFetcher } from '@remix-run/react';
import { getCarrierByName } from '../../../libs/carriers/carrierlist';
import { CarrierCardProps, CarrierCardState } from '../../../libs/carriers/types/carrier';

const ARAMEX_NAME = 'Aramex';
const aramexConfig = getCarrierByName(ARAMEX_NAME);

type AramexLookupData = {
    success: boolean;
    error?: string;
    data?: any;
};

type ApiKeySaverData = {
    success: boolean;
    error?: string;
};

type ApiKeyFetcherData = {
    success: boolean;
    apiKey?: string;
    error?: string;
};

type CarrierStatusData = {
    success: boolean;
    isActive: boolean;
    error?: string;
};

export function AramexCard({
    shop,
    carrierName = ARAMEX_NAME,
    statusURL,
    apiKeyEnvVar = 'ARAMEX_API_KEY',
    defaultApiKey = ''
}: CarrierCardProps) {
    const [state, setState] = useState<CarrierCardState>({
        isEnabled: false,
        apiKey: '',
        isLoading: true,
        error: null,
        isEditing: false,
    });

    const [isApiKeySaveInitiated, setIsApiKeySaveInitiated] = useState(false);

    const fetcher = useFetcher<AramexLookupData>();
    const apiKeySaver = useFetcher<ApiKeySaverData>();
    const apiKeyFetcher = useFetcher<ApiKeyFetcherData>();
    const carrierStatusFetcher = useFetcher<CarrierStatusData>();

    const testUrl = '/api/aramex-lookup';

    // Fetch carrier status and API key on component mount
    useEffect(() => {
        const fetchInitialData = () => {
            carrierStatusFetcher.submit(
                { carrierName },
                { method: 'post', action: '/api/get-carrier-status' }
            );
            apiKeyFetcher.submit(
                { carrierName },
                { method: 'post', action: '/api/get-api-key' }
            );
        };

        fetchInitialData();
    }, [carrierName]);

    // Update state when carrier status is fetched
    useEffect(() => {
        if (carrierStatusFetcher.state === 'idle' && carrierStatusFetcher.data) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                isEnabled: carrierStatusFetcher.data?.success ? carrierStatusFetcher.data.isActive : prev.isEnabled,
                error: carrierStatusFetcher.data?.success ? null : (carrierStatusFetcher.data?.error || 'Failed to fetch carrier status'),
            }));
        }
    }, [carrierStatusFetcher.state, carrierStatusFetcher.data]);

    // Update state when API key is fetched
    useEffect(() => {
        if (apiKeyFetcher.state === 'idle' && apiKeyFetcher.data) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                apiKey: apiKeyFetcher.data?.success ? (apiKeyFetcher.data.apiKey || '') : prev.apiKey,
                error: apiKeyFetcher.data?.success ? null : (apiKeyFetcher.data?.error || 'Failed to fetch API key'),
            }));
        }
    }, [apiKeyFetcher.state, apiKeyFetcher.data]);

    const handleToggle = useCallback(async () => {
        const newStatus = !state.isEnabled;
        try {
            const formData = new FormData();
            formData.append('carrierName', carrierName);
            formData.append('isActive', newStatus.toString());

            const response = await fetch('/api/update-carrier-status', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update carrier status');
            }
            setState(prev => ({ ...prev, isEnabled: newStatus }));
            console.log('Carrier status updated successfully:', data);
        } catch (error: unknown) {
            console.error(`Failed to update ${carrierName} status:`, error);
            if (error instanceof Error) {
                console.error('Error details:', error.message);
            }
            setState(prev => ({ ...prev, error: 'Failed to update carrier status' }));
        }
    }, [state.isEnabled, carrierName]);

    const performLookup = useCallback(() => {
        if (state.apiKey) {
            fetcher.submit(
                { apiKey: state.apiKey, checkType: 'uptime' },
                { method: 'post', action: testUrl }
            );
        }
    }, [state.apiKey, fetcher, testUrl]);

    const handleApiKeyChange = useCallback((value: string) => {
        setState(prev => ({ ...prev, apiKey: value }));
    }, []);

    const handleSaveApiKey = useCallback(() => {
        console.log('Saving API key for:', carrierName);
        console.log('API Key:', state.apiKey);
        apiKeySaver.submit(
            { carrierName, apiKey: state.apiKey },
            { method: 'post', action: '/api/save-api-key' }
        );
        setIsApiKeySaveInitiated(true);
        setState(prev => ({ ...prev, isEditing: false }));
    }, [apiKeySaver, carrierName, state.apiKey]);

    useEffect(() => {
        if (!isApiKeySaveInitiated) return;

        console.log('apiKeySaver state:', apiKeySaver.state);
        console.log('apiKeySaver data:', apiKeySaver.data);

        if (apiKeySaver.state === 'idle') {
            if (apiKeySaver.data) {
                const data = apiKeySaver.data as ApiKeySaverData;
                if ('error' in data && data.error) {
                    console.error('Error saving API key:', data.error);
                    setState(prev => ({ ...prev, error: data.error || 'Unknown error occurred' }));
                } else if ('success' in data && data.success) {
                    console.log('API key saved successfully', data);
                    setState(prev => ({ ...prev, error: null }));
                } else {
                    console.warn('Unexpected data structure from apiKeySaver:', data);
                    setState(prev => ({ ...prev, error: 'Unexpected response when saving API key' }));
                }
            } else {
                console.log('apiKeySaver is idle but no data is present');
            }
        }
    }, [apiKeySaver.state, apiKeySaver.data, isApiKeySaveInitiated]);

    const toggleButtonText = state.isEnabled ? 'Disable' : 'Enable';

    return (
        <Card>
            <BlockStack gap="400">
                <InlineStack align="space-between">
                    <Text as="h3" variant="headingMd">
                        {carrierName}
                    </Text>
                    <InlineStack gap="200">
                        <Button
                            onClick={handleToggle}
                            pressed={state.isEnabled}
                            role="switch"
                            ariaChecked={state.isEnabled ? 'true' : 'false'}
                            size="slim"
                        >
                            {toggleButtonText}
                        </Button>
                        <Button onClick={performLookup} disabled={!state.isEnabled} size="slim">
                            Test API Connection
                        </Button>
                    </InlineStack>
                </InlineStack>
                <FormLayout>
                    {state.isLoading ? (
                        <Spinner accessibilityLabel="Loading carrier data" size="small" />
                    ) : (
                        <>
                            {state.error && (
                                <Banner tone="critical">Error: {state.error}</Banner>
                            )}
                            <TextField
                                label="API Key"
                                value={state.apiKey}
                                onChange={handleApiKeyChange}
                                autoComplete="off"
                                readOnly={!state.isEditing}
                            />
                            <InlineStack gap="200">
                                {state.isEditing ? (
                                    <Button onClick={handleSaveApiKey} variant="primary">
                                        Save API Key
                                    </Button>
                                ) : (
                                    <Button onClick={() => setState(prev => ({ ...prev, isEditing: true }))}>
                                        Edit API Key
                                    </Button>
                                )}
                            </InlineStack>
                        </>
                    )}
                    <Text as="p" variant="bodyMd">
                        This carrier is {state.isEnabled ? 'enabled' : 'disabled'}
                    </Text>
                    {fetcher.data && 'success' in fetcher.data && !fetcher.data.success && (
                        <Banner tone="critical">
                            <p>Error: {fetcher.data.error || 'An unknown error occurred'}</p>
                            <p>API Key used: {state.apiKey}</p>
                            <p>Please check your API key and try again. If the problem persists, contact Aramex support.</p>
                        </Banner>
                    )}
                    {fetcher.data && 'success' in fetcher.data && fetcher.data.success && (
                        <Banner tone="success" title="API Connection Successful">
                            <p>API Key used: {state.apiKey}</p>
                            <p>API URL: {testUrl}</p>
                            <pre>{JSON.stringify(fetcher.data.data, null, 2)}</pre>
                        </Banner>
                    )}
                    {apiKeySaver.data && 'success' in apiKeySaver.data && !apiKeySaver.data.success && (
                        <Banner tone="critical">
                            <p>Error: {apiKeySaver.data.error || 'An unknown error occurred while saving the API key'}</p>
                            <p>Please try again. If the problem persists, contact support.</p>
                        </Banner>
                    )}
                    {apiKeySaver.data && 'success' in apiKeySaver.data && apiKeySaver.data.success && (
                        <Banner tone="success" title="API Key Saved Successfully">
                            <p>Your Aramex API key has been saved.</p>
                        </Banner>
                    )}
                </FormLayout>
            </BlockStack>
        </Card>
    );
}