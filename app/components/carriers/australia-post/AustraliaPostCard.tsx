import React, { useState, useCallback, useEffect } from 'react';
import { Card, BlockStack, Text, TextField, FormLayout, Button, Banner, Link, InlineStack, Spinner } from '@shopify/polaris';
import { useFetcher } from '@remix-run/react';
import { getCarrierByName } from '../../../libs/carriers/carrierlist';

const AUSTRALIA_POST_NAME = 'Australia Post';
const australiaPostConfig = getCarrierByName(AUSTRALIA_POST_NAME);

type AustraliaPostLookupData = {
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

export function AustraliaPostCard({ shop }: { shop: string }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const fetcher = useFetcher<AustraliaPostLookupData>();
  const apiKeySaver = useFetcher<ApiKeySaverData>();
  const apiKeyFetcher = useFetcher<ApiKeyFetcherData>();

  const testUrl = '/api/australia-post-lookup';

  useEffect(() => {
    const fetchApiKey = async () => {
      setIsLoading(true);
      apiKeyFetcher.submit(
        { carrierName: AUSTRALIA_POST_NAME },
        { method: 'post', action: '/api/get-api-key' }
      );
    };

    fetchApiKey();
  }, []); // Add an empty dependency array here

  useEffect(() => {
    if (apiKeyFetcher.state === 'idle' && apiKeyFetcher.data) {
      setIsLoading(false);
      if (apiKeyFetcher.data.success) {
        setApiKey(apiKeyFetcher.data.apiKey || '');
      } else {
        setError(apiKeyFetcher.data.error || 'Failed to fetch API key');
      }
    }
  }, [apiKeyFetcher.state, apiKeyFetcher.data]);

  const handleToggle = useCallback(async () => {
    const newStatus = !isEnabled;
    setIsEnabled(newStatus);
    try {
      const formData = new FormData();
      formData.append('carrierName', AUSTRALIA_POST_NAME);
      formData.append('isActive', newStatus.toString());

      const response = await fetch('/api/update-carrier-status', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update carrier status');
      }
      console.log('Carrier status updated successfully:', data);
    } catch (error: unknown) {
      console.error('Failed to update Australia Post status:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      setIsEnabled(!newStatus);
    }
  }, [isEnabled]);

  const performLookup = useCallback(() => {
    if (apiKey) {
      fetcher.submit(
        { apiKey, checkType: 'uptime' },
        { method: 'post', action: testUrl }
      );
    }
  }, [apiKey, fetcher, testUrl]);

  const handleApiKeyChange = useCallback((value: string) => {
    setApiKey(value);
  }, [setApiKey]);

  const handleSaveApiKey = useCallback(() => {
    console.log('Saving API key for:', AUSTRALIA_POST_NAME);
    console.log('API Key:', apiKey);
    apiKeySaver.submit(
      { carrierName: AUSTRALIA_POST_NAME, apiKey },
      { method: 'post', action: '/api/save-api-key' }
    );
    setIsEditing(false);
  }, [apiKeySaver, apiKey]);

  useEffect(() => {
    if (apiKeySaver.state === 'idle' && apiKeySaver.data) {
      console.log('API Key Save Response:', apiKeySaver.data);
      if (apiKeySaver.data.error) {
        console.error('Error saving API key:', apiKeySaver.data.error);
        // Handle error (e.g., show error message to user)
      } else if (apiKeySaver.data.success) {
        console.log('API key saved successfully', apiKeySaver.data);
        // Handle success (e.g., show success message to user)
      }
    }
  }, [apiKeySaver.state, apiKeySaver.data]);

  const toggleButtonText = isEnabled ? 'Disable' : 'Enable';

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between">
          <Text as="h3" variant="headingMd">
            {AUSTRALIA_POST_NAME}
          </Text>
          <InlineStack gap="200">
            <Button
              onClick={handleToggle}
              pressed={isEnabled}
              role="switch"
              ariaChecked={isEnabled ? 'true' : 'false'}
              size="slim"
            >
              {toggleButtonText}
            </Button>
            <Button onClick={performLookup} disabled={!isEnabled} size="slim">
              Test API Connection
            </Button>
          </InlineStack>
        </InlineStack>
        <FormLayout>
          {isLoading ? (
            <Spinner accessibilityLabel="Loading API key" size="small" />
          ) : (
            <>
              {error && (
                <Banner tone="critical">Error loading API key: {error}</Banner>
              )}
              <TextField
                label="API Key"
                value={apiKey}
                onChange={handleApiKeyChange}
                autoComplete="off"
                readOnly={!isEditing}
              />
              <InlineStack gap="200">
                {isEditing ? (
                  <Button onClick={handleSaveApiKey} variant="primary">
                    Save API Key
                  </Button>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit API Key
                  </Button>
                )}
              </InlineStack>
            </>
          )}
          <Text as="p" variant="bodyMd">
            This carrier is {isEnabled ? 'enabled' : 'disabled'}
          </Text>
          <Text as="p" variant="bodyMd">
            This test will attempt to calculate shipping for a standard parcel (10x10x10cm, 1kg) from Melbourne (3000) to Sydney (2000).
          </Text>
          {fetcher.data && 'success' in fetcher.data && !fetcher.data.success && (
            <Banner tone="critical">
              <p>Error: {fetcher.data.error || 'An unknown error occurred'}</p>
              <p>API Key used: {apiKey}</p>
              <p>Please check your API key and try again. If the problem persists, contact Australia Post support or refer to the <Link url="https://developers.auspost.com.au/apis/pac/reference" external>API documentation</Link>.</p>
            </Banner>
          )}
          {fetcher.data && 'success' in fetcher.data && fetcher.data.success && (
            <Banner tone="success" title="API Connection Successful">
              <p>API Key used: {apiKey}</p>
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
              <p>Your Australia Post API key has been saved.</p>
            </Banner>
          )}
        </FormLayout>
      </BlockStack>
    </Card>
  );
}
