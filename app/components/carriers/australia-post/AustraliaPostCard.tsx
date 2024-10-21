import React, { useState, useCallback, useEffect } from 'react';
import { Card, BlockStack, Text, TextField, FormLayout, Button, Banner, Link, InlineStack, Spinner, Popover, ActionList, Icon, RadioButton, DataTable, Checkbox } from '@shopify/polaris';
import { CheckIcon, XSmallIcon } from '@shopify/polaris-icons';
import { useFetcher } from '@remix-run/react';
import { getCarrierByName } from '../../../libs/carriers/carrierlist';
import { CarrierCardProps, CarrierCardState } from '../../../libs/carriers/types/carrier';

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
      if (newStatus) {
        setShowActivationBanner(true);
      } else {
        setShowActivationBanner(false);
      }
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
    setHasApiKeyChanged(true);
  }, []);

  const handleSaveApiKey = useCallback(() => {
    console.log('Saving API key for:', carrierName);
    console.log('API Key:', state.apiKey);
    apiKeySaver.submit(
      { carrierName, apiKey: state.apiKey },
      { method: 'post', action: '/api/save-api-key' }
    );
    setIsApiKeySaveInitiated(true);
    setHasApiKeyChanged(false);
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

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const handleDisable = useCallback(() => {
    handleToggle();
    setPopoverActive(false);
  }, [handleToggle]);

  const handleManageAction = useCallback((action: string) => {
    setPopoverActive(false);
    if (action === 'disable') {
      handleDisable();
    } else if (action === 'apiKey') {
      setState(prev => ({ ...prev, isEditing: true }));
    }
  }, [handleDisable]);

  const activator = (
    <Button variant="plain" onClick={togglePopoverActive} disclosure >
      Manage
    </Button>
  );

  const handleDismissBanner = useCallback(() => {
    setShowActivationBanner(false);
  }, []);

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

  useEffect(() => {
    if (apiKeySaver.state === 'idle' && apiKeySaver.data) {
      if (apiKeySaver.data.success) {
        console.log('Carrier configuration updated successfully');
      } else {
        console.error('Failed to update carrier configuration:', apiKeySaver.data?.error);
        setState(prev => ({ ...prev, error: apiKeySaver.data?.error || 'Failed to update carrier configuration' }));
      }
    }
  }, [apiKeySaver.state, apiKeySaver.data]);

  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="200">
          <InlineStack align="space-between">
            <Text as="h3" variant="headingMd">
              {carrierName}
            </Text>
            {state.isEnabled ? (
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
                      content: 'API Key',
                      onAction: () => handleManageAction('apiKey'),
                    },
                    {
                      content: 'Disable Australia Post',
                      onAction: () => handleManageAction('disable'),
                      destructive: true,
                    },
                  ]}
                />
              </Popover>
            ) : (
              <Button
                onClick={handleToggle}
                pressed={state.isEnabled}
                role="switch"
                ariaChecked={state.isEnabled ? 'true' : 'false'}
                size="slim"
              >
                Enable
              </Button>
            )}
          </InlineStack>
          {showActivationBanner && (
            <Banner tone="success" icon={CheckIcon} onDismiss={handleDismissBanner}>
              <InlineStack align="space-between">
                <BlockStack>
                  <p>Australia Post activated</p>
                  {(!state.apiKey || state.apiKey === defaultApiKey) && (
                    <p>
                      <Link url="https://developers.auspost.com.au/apis/st-registration" external>
                        Connect your API Key
                      </Link>
                    </p>
                  )}
                </BlockStack>
              </InlineStack>
            </Banner>
          )}
        </BlockStack>
        {state.isEnabled && (
          <BlockStack gap="400">
            {state.isLoading ? (
              <Spinner accessibilityLabel="Loading carrier data" size="small" />
            ) : (
              <>
                {state.error && (
                  <Banner tone="critical">Error: {state.error}</Banner>
                )}
                {apiKeySaver.data && 'success' in apiKeySaver.data && apiKeySaver.data.success && (
                  <Banner tone="success" title="API Key Saved Successfully">
                    <p>Your Australia Post API key has been saved.</p>
                  </Banner>
                )}
                {(state.isEditing || state.apiKey === defaultApiKey) && (
                  <BlockStack gap="400">
                    <Banner tone="success" title="API Key Saved Successfully">
                      <p>Your Australia Post API key has been saved.</p>
                    </Banner>
                    <TextField
                      label="API Key"
                      value={state.apiKey}
                      onChange={handleApiKeyChange}
                      autoComplete="off"
                    />
                    <InlineStack>
                      <Button
                        onClick={handleSaveApiKey}
                        variant="primary"
                        disabled={!hasApiKeyChanged}
                      >
                        Save API Key
                      </Button>
                    </InlineStack>
                  </BlockStack>
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

                  <Text as="h3" variant="headingMd">
                    Use description in rates
                  </Text>
                  
                    <RadioButton
                      label="Yes"
                      checked={state.useDescription}
                      id="use-description-yes"
                      name="use-description"
                      onChange={() => handleUseDescriptionChange(true)}
                    />
                    <RadioButton
                      label="No"
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
              </>
            )}
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}
