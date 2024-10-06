import React, { useState } from 'react';
import { Card, BlockStack, Text, TextField, RadioButton, FormLayout } from '@shopify/polaris';

const ARAMEX_NAME = "Aramex";

export function Aramex() {
  const [apiKey, setApiKey] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h3" variant="headingMd">
          {ARAMEX_NAME}
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
            id="aramex-enable"
            name="aramex-status"
            onChange={(checked) => setIsEnabled(checked)}
          />
          <RadioButton
            label="Disable"
            checked={!isEnabled}
            id="aramex-disable"
            name="aramex-status"
            onChange={(checked) => setIsEnabled(!checked)}
          />
        </FormLayout>
      </BlockStack>
    </Card>
  );
}
