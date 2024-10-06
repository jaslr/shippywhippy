import React, { useState } from 'react';
import { Card, BlockStack, Text, TextField, RadioButton, FormLayout } from '@shopify/polaris';
import { AUSTRALIA_POST_NAME } from './constants';

export function AustraliaPostCard() {
  const [apiKey, setApiKey] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h3" variant="headingMd">
          {AUSTRALIA_POST_NAME}
        </Text>
        <FormLayout>
          <TextField
            label="API Key"
            value={apiKey}
            onChange={setApiKey}
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
        </FormLayout>
      </BlockStack>
    </Card>
  );
}