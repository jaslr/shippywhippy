import React, { useState, useCallback } from 'react';
import { Card, BlockStack, Text, TextField, FormLayout, Button, Banner, Link, InlineStack, Spinner } from '@shopify/polaris';
import { useFetcher } from '@remix-run/react';
import { updateCarrierStatus, saveApiKey } from '../../../libs/carriers/utils/carrierHelpers';
import { getCarrierByName } from '../../../libs/carriers/carrierlist';
import { useApiKey } from '../../../hooks/useApiKey';

const AUSTRALIA_POST_NAME = 'Australia Post';
const australiaPostConfig = getCarrierByName(AUSTRALIA_POST_NAME);

type AustraliaPostLookupData = {
  success: boolean;
  error?: string;
  data?: any;
};

export function AustraliaPostCard({ shop }: { shop: string }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const { apiKey, setApiKey, isLoading, error } = useApiKey(shop, AUSTRALIA_POST_NAME);
  const [isEditing, setIsEditing] = useState(false);
  const fetcher = useFetcher<AustraliaPostLookupData>();

  const testUrl = '/api/australia-post-lookup';

  const handleToggle = useCallback(async () => {
    const newStatus = !isEnabled;
    setIsEnabled(newStatus);
    try {
      await updateCarrierStatus(shop, AUSTRALIA_POST_NAME, newStatus);
    } catch (error) {
      console.error('Failed to update Australia Post status:', error);
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

  const handleApiKeyChange = useCallback((value: string) => {
    setApiKey(value);
  }, [setApiKey]);

  const handleSaveApiKey = useCallback(async () => {
    try {
      await saveApiKey(shop, AUSTRALIA_POST_NAME, apiKey);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  }, [shop, apiKey]);

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
        </FormLayout>
      </BlockStack>
    </Card>
  );
}
