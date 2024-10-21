import React, { useState, useCallback, useEffect } from 'react';
import { Card, BlockStack, Text, TextField, FormLayout, Button, Banner, Link, InlineStack, Spinner, Popover, ActionList, Icon, RadioButton, DataTable, Checkbox } from '@shopify/polaris';
import { CheckIcon, XSmallIcon } from '@shopify/polaris-icons';
import { useFetcher } from '@remix-run/react';
import { getCarrierByName } from '../../../libs/carriers/carrierlist';
import { CarrierCardProps, CarrierCardState, CarrierConfig } from '../../../libs/carriers/types/carrier';
import { getCarrierConfigByShopAndCarrier } from '../../../libs/carriers/carrierConfigUtils';

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

type CarrierStatusData = {
  success: boolean;
  isActive: boolean;
  error?: string;
};

export function AustraliaPostCard({
  shop,
  carrierName = 'Australia Post',
  statusURL,
  apiKeyEnvVar = 'AUSTRALIA_POST_API_KEY',
  defaultApiKey = ''
}: CarrierCardProps) {
  const [state, setState] = useState<CarrierCardState>({
    isEnabled: false,
    apiKey: '',
    isLoading: true,
    error: null,
    isEditing: true,
    useDescription: true,
  });

  const [isApiKeySaveInitiated, setIsApiKeySaveInitiated] = useState(false);
  const [popoverActive, setPopoverActive] = useState(false);
  const [hasApiKeyChanged, setHasApiKeyChanged] = useState(false);
  const [showActivationBanner, setShowActivationBanner] = useState(false);
  const [showApiKeySavedBanner, setShowApiKeySavedBanner] = useState(false);
  const [showApiKeySection, setShowApiKeySection] = useState(false);
  const [carrierConfig, setCarrierConfig] = useState<CarrierConfig | null>(null);

  const fetcher = useFetcher<AustraliaPostLookupData>();
  const apiKeySaver = useFetcher<ApiKeySaverData>();
  const apiKeyFetcher = useFetcher<ApiKeyFetcherData>();
  const carrierStatusFetcher = useFetcher<CarrierStatusData>();

  const testUrl = '/api/australia-post-lookup';

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
        isEnabled: carrierStatusFetcher.data?.isActive ?? false,
        isLoading: false
      }));
    }
  }, [carrierStatusFetcher.state, carrierStatusFetcher.data]);

  // Update state when API key is fetched
  useEffect(() => {
    if (apiKeyFetcher.state === 'idle' && apiKeyFetcher.data) {
      setState(prev => ({
        ...prev,
        apiKey: apiKeyFetcher.data?.apiKey || '',
        isEditing: !apiKeyFetcher.data?.apiKey
      }));
    }
  }, [apiKeyFetcher.state, apiKeyFetcher.data]);

  const handleToggleCarrier = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch('/api/toggle-carrier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ carrierName, isEnabled: !state.isEnabled }),
      });
      if (!response.ok) {
        throw new Error('Failed to toggle carrier');
      }
      const data = await response.json();
      setState(prev => ({ ...prev, isEnabled: data.isActive, isLoading: false }));
      if (data.isActive) {
        setShowActivationBanner(true);
        setTimeout(() => setShowActivationBanner(false), 5000);
      }
    } catch (error) {
      console.error('Error toggling carrier:', error);
      setState(prev => ({ ...prev, isLoading: false, error: 'Failed to toggle carrier' }));
    }
  }, [carrierName, state.isEnabled]);

  const handleApiKeyChange = useCallback((value: string) => {
    setState(prev => ({ ...prev, apiKey: value }));
    setHasApiKeyChanged(true);
  }, []);

  const handleSaveApiKey = useCallback(async () => {
    setIsApiKeySaveInitiated(true);
    apiKeySaver.submit(
      { carrierName, apiKey: state.apiKey },
      { method: 'post', action: '/api/save-api-key' }
    );
  }, [carrierName, state.apiKey]);

  useEffect(() => {
    if (isApiKeySaveInitiated && apiKeySaver.state === 'idle') {
      setIsApiKeySaveInitiated(false);
      if (apiKeySaver.data?.success) {
        setState(prev => ({ ...prev, isEditing: false }));
        setHasApiKeyChanged(false);
        setShowApiKeySavedBanner(true);
        setTimeout(() => setShowApiKeySavedBanner(false), 5000);
      }
    }
  }, [apiKeySaver.state, apiKeySaver.data, isApiKeySaveInitiated]);

  const handleEditApiKey = useCallback(() => {
    setState(prev => ({ ...prev, isEditing: true }));
  }, []);

  const handleCancelEdit = useCallback(() => {
    apiKeyFetcher.submit(
      { carrierName },
      { method: 'post', action: '/api/get-api-key' }
    );
    setState(prev => ({ ...prev, isEditing: false }));
    setHasApiKeyChanged(false);
  }, [carrierName]);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const handleUseDescriptionChange = useCallback(async (checked: boolean) => {
    setState(prev => ({ ...prev, useDescription: checked }));

    console.log('Updating use description:', { checked, carrierName, shopUrl: shop.shopifyUrl });

    try {
      const response = await fetch('/api/update-carrier-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carrierName,
          useDescription: checked,
          shopUrl: shop.shopifyUrl
        }),
      });

      const data = await response.json();
      console.log('Carrier configuration update response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update carrier configuration');
      }

      if (data.success) {
        console.log('Carrier configuration updated successfully');
      } else {
        throw new Error(data.error || 'Failed to update carrier configuration');
      }
    } catch (error: unknown) {
      console.error('Error updating carrier configuration:', error);
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'An unknown error occurred' }));
    }
  }, [carrierName, shop.shopifyUrl]);

  const activator = (
    <Button onClick={togglePopoverActive} variant="plain" disclosure>
      Manage
    </Button>
  );

  const handleTestApiKey = useCallback(() => {
    if (!carrierConfig?.apiKey) return;

    fetcher.submit(
      { apiKey: carrierConfig.apiKey },
      { method: 'post', action: '/api/australia-post-test' }
    );
  }, [carrierConfig?.apiKey]);

  const [services, setServices] = useState<{ code: string; name: string; disabled: boolean }[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      if (!state.apiKey) return;

      setIsLoadingServices(true);
      try {
        const response = await fetch(`/api/australia-post-services?apiKey=${encodeURIComponent(state.apiKey)}`);
        if (response.ok) {
          const data = await response.json();
          setServices((data.services || []).map((service: { code: string; name: string }) => ({ ...service, disabled: false })));
        } else {
          console.error('Failed to fetch services');
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServices();
  }, [state.apiKey]);

  const handleServiceDisableToggle = useCallback((index: number) => {
    setServices(prevServices => {
      const newServices = [...prevServices];
      newServices[index].disabled = !newServices[index].disabled;
      return newServices;
    });
  }, []);

  const handleShowApiKey = useCallback(() => {
    setShowApiKeySection(true);
  }, []);

  const handleHideApiKey = useCallback(() => {
    setShowApiKeySection(false);
  }, []);

  // Fetch carrier config on component mount
  useEffect(() => {
    const fetchCarrierConfig = async () => {
      const config = await getCarrierConfigByShopAndCarrier(Number(shop.id), carrierName);
      setCarrierConfig(config);
      if (config) {
        setState(prev => ({ ...prev, apiKey: config.apiKey || '' }));
      }
    };

    fetchCarrierConfig();
  }, [shop.id, carrierName]);

  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between">
        <Text as="h2" variant="headingSm">
        {carrierName}
          </Text>
          <InlineStack gap="300">
            {state.isLoading ? (
              <Spinner accessibilityLabel="Loading" size="small" />
            ) : (
              <Popover
                active={popoverActive}
                activator={activator}
                autofocusTarget="first-node"
                onClose={togglePopoverActive}
              >
                <ActionList
                  actionRole="menuitem"
                  items={[
                    {
                      content: state.isEnabled ? 'Disable' : 'Enable',
                      onAction: handleToggleCarrier,
                    },
                    {
                      content: 'API Key',
                      onAction: handleShowApiKey,
                    },
                    ...(carrierConfig?.apiKey ? [{
                      content: 'Test API Key',
                      onAction: handleTestApiKey,
                    }] : []),
                  ]}
                />
              </Popover>
            )}
          </InlineStack>
        </InlineStack>
        {showActivationBanner && (
          <Banner tone="success" onDismiss={() => setShowActivationBanner(false)}>
            <p>Australia Post has been activated successfully.</p>
          </Banner>
        )}
        {showApiKeySavedBanner && (
          <Banner tone="success" onDismiss={() => setShowApiKeySavedBanner(false)}>
            <p>API Key saved successfully.</p>
          </Banner>
        )}
        {state.error && (
          <Banner tone="critical" onDismiss={() => setState(prev => ({ ...prev, error: null }))}>
            <p>{state.error}</p>
          </Banner>
        )}
        {state.isEnabled && (
          <BlockStack gap="400">
            {showApiKeySection && (
              <>
                <Text as="h3" variant="headingMd">
                  API Key
                </Text>
                <FormLayout>
                  <TextField
                    label="API Key"
                    value={state.apiKey}
                    onChange={handleApiKeyChange}
                    autoComplete="off"
                  />
                  <InlineStack gap="300">
                    <Button onClick={handleSaveApiKey} disabled={!hasApiKeyChanged}>
                      Save
                    </Button>
                    <Button onClick={handleHideApiKey}>Cancel</Button>
                  </InlineStack>
                </FormLayout>
              </>
            )}
            {fetcher.state === 'submitting' && (
              <InlineStack align="center">
                <Spinner accessibilityLabel="Loading" size="small" />
                <Text as="span" variant="bodyMd">Testing API Key...</Text>
              </InlineStack>
            )}
            {fetcher.data && 'success' in fetcher.data && !fetcher.data.success && (
              <Banner tone="critical">
                <p>Error: {fetcher.data.error || 'An unknown error occurred'}</p>
                <p>API Key used: {state.apiKey}</p>
                <p>Please check your API key and try again. If the problem persists, contact Australia Post support or refer to the <Link url="https://developers.auspost.com.au/apis/pac/reference" external>API documentation</Link>.</p>
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

            <Text as="h3" variant="headingSm" fontWeight="medium">
              Display description in shipping rates
            </Text>

            <RadioButton
              label="Show"
              checked={state.useDescription}
              id="use-description-yes"
              name="use-description"
              onChange={() => handleUseDescriptionChange(true)}
            />
            <RadioButton
              label="Hide"
              checked={!state.useDescription}
              id="use-description-no"
              name="use-description"
              onChange={() => handleUseDescriptionChange(false)}
            />

            {apiKeySaver.data && !apiKeySaver.data.success && (
              <Banner tone="critical">
                <p>Error: {apiKeySaver.data.error || 'Failed to update carrier configuration'}</p>
              </Banner>
            )}
            <Text as="h3" variant="headingMd">
              Australia Post Domestic Services
            </Text>
            {isLoadingServices ? (
              <Spinner accessibilityLabel="Loading services" size="small" />
            ) : services.length > 0 ? (
              <DataTable
                columnContentTypes={['text', 'text', 'text']}
                headings={['Code', 'Name', 'Disable']}
                rows={services.map((service, index) => [
                  service.code,
                  service.name,
                  <Checkbox
                    label="Disable"
                    checked={service.disabled}
                    onChange={() => handleServiceDisableToggle(index)}
                    labelHidden
                  />
                ])}
              />
            ) : (
              <Text as="p">No services available.</Text>
            )}
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}
