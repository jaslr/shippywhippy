import React, { useState, useEffect } from 'react';
import { Card, BlockStack, Text, TextField, RadioButton, FormLayout, Button, Banner } from '@shopify/polaris';
import { AUSTRALIA_POST_NAME, AUSTRALIA_POST_API_KEY } from './constants';

const API_KEY = AUSTRALIA_POST_API_KEY;

export function AustraliaPostCard() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [lookupResult, setLookupResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const performLookup = async () => {
    setError(null);
    setLookupResult(null);

    const fromPostcode = '3000'; // Melbourne
    const toPostcode = '2000'; // Sydney
    const length = '10';
    const width = '10';
    const height = '10';
    const weight = '1';

    try {
      const response = await fetch(`https://digitalapi.auspost.com.au/postage/parcel/domestic/calculate.json?from_postcode=${fromPostcode}&to_postcode=${toPostcode}&length=${length}&width=${width}&height=${height}&weight=${weight}`, {
        headers: {
          'AUTH-KEY': API_KEY
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data from Australia Post API');
      }

      const data = await response.json();
      setLookupResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
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
          {error && (
            <Banner tone="critical">
              {error}
            </Banner>
          )}
          {lookupResult && (
            <Banner tone="success" title="API Connection Successful">
              <pre>{lookupResult}</pre>
            </Banner>
          )}
        </FormLayout>
      </BlockStack>
    </Card>
  );
}