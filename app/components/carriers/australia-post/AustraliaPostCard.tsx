import React, { useState } from 'react';
import { Card, BlockStack, Text, TextField, RadioButton, FormLayout, Button, Banner, Link } from '@shopify/polaris';
import { AUSTRALIA_POST_NAME, AUSTRALIA_POST_API_KEY } from './constants';
import { useFetcher } from '@remix-run/react';

type AustraliaPostLookupData = {
  success: boolean;
  error?: string;
  data?: any;
};

const API_KEY = AUSTRALIA_POST_API_KEY;

export function AustraliaPostCard() {
  const [isEnabled, setIsEnabled] = useState(false);
  const fetcher = useFetcher<AustraliaPostLookupData>();

  const testUrl = '/api/australia-post-lookup';

  const performLookup = () => {
    fetcher.submit(
      { apiKey: API_KEY },
      { method: 'post', action: testUrl }
    );
  };

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h3" variant="headingMd">
          {AUSTRALIA_POST_NAME}
        </Text>
        <FormLayout>
          <TextField
            label="API Key"
            value={API_KEY}
            readOnly
            autoComplete="off"
          />
          <RadioButton
            label="Enable"
            checked={isEnabled}
            id="australia-post-enable"
            name="australia-post-status"
            onChange={(checked) => setIsEnabled(checked)}
          />
          <RadioButton
            label="Disable"
            checked={!isEnabled}
            id="australia-post-disable"
            name="australia-post-status"
            onChange={(checked) => setIsEnabled(!checked)}
          />
          <Button onClick={performLookup}>Test API Connection</Button>
          <Text as="p" variant="bodyMd">
            This test will attempt to calculate shipping for a standard parcel (10x10x10cm, 1kg) from Melbourne (3000) to Sydney (2000).
          </Text>
          {fetcher.data && 'success' in fetcher.data && !fetcher.data.success && (
            <Banner tone="critical">
              <p>Error: {fetcher.data.error || 'An unknown error occurred'}</p>
              <p>API Key used: {API_KEY}</p>
              <p>Please check your API key and try again. If the problem persists, contact Australia Post support or refer to the <Link url="https://developers.auspost.com.au/apis/pac/reference" external>API documentation</Link>.</p>
            </Banner>
          )}
          {fetcher.data && 'success' in fetcher.data && fetcher.data.success && (
            <Banner tone="success" title="API Connection Successful">
              <p>API Key used: {API_KEY}</p>
              <p>API URL: {testUrl}</p>
              <pre>{JSON.stringify(fetcher.data.data, null, 2)}</pre>
            </Banner>
          )}
        </FormLayout>
      </BlockStack>
    </Card>
  );
}