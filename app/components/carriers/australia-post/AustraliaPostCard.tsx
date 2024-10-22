import React, { useState, useCallback, useEffect } from 'react';
import { Card, BlockStack, Text, TextField, FormLayout, Button, Banner, Link, LegacyCard, InlineStack, Spinner, Popover, ActionList, Icon, RadioButton, DataTable, Checkbox, Tooltip, Tabs, Select } from '@shopify/polaris';
import { CheckIcon, XSmallIcon } from '@shopify/polaris-icons';
import { useFetcher } from '@remix-run/react';
import { getCarrierByName } from '../../../libs/carriers/carrierlist';
import { CarrierCardProps, CarrierCardState, CarrierConfig } from '../../../libs/carriers/types/carrier';
import { getCarrierConfigByShopAndCarrier } from '../../../libs/carriers/carrierConfigUtils';
import { json } from '@remix-run/node';
import { countries } from './countryTypes';

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

// Add this constant to control the filter
const EXCLUDE_SMALL_SERVICE = true;

// Add this constant at the top of the file, after imports
const DEFAULT_INTERNATIONAL_COUNTRY = 'US'; // United States

interface Service {
  code: string;
  name: string;
  disabled: boolean;
}

// Define a custom action item type
interface CustomActionItem {
  content: string;
  onAction: () => void;
  destructive?: boolean;
}

// Update the InternationalService interface
interface InternationalService {
  code: string;
  name: string;
  price: string;
  max_extra_cover: number;
  location: string;
  postalCode: string;
  disabled: boolean;
}

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
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [services, setServices] = useState<Array<Service & { location: string; postalCode: string }>>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_INTERNATIONAL_COUNTRY);
  const [internationalServices, setInternationalServices] = useState<InternationalService[]>([]);
  const [isLoadingInternationalServices, setIsLoadingInternationalServices] = useState(false);
  const [requestUrl, setRequestUrl] = useState('');
  const [requestHeaders, setRequestHeaders] = useState('{}'); // Initialize with empty object string
  const [locations, setLocations] = useState<Array<{ id: string; name: string; address: string; zipCode: string | null }>>([]);

  const fetcher = useFetcher<AustraliaPostLookupData>();
  const apiKeySaver = useFetcher<ApiKeySaverData>();
  const apiKeyFetcher = useFetcher<ApiKeyFetcherData>();
  const carrierStatusFetcher = useFetcher<CarrierStatusData>();

  const testUrl = '/api/australia-post-lookup';

  const countryOptions = countries.map(country => ({
    label: country.name,
    value: country.code
  }));

  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/shopify-locations');
        console.log('Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched locations data:', data);
          if (data.locations && Array.isArray(data.locations)) {
            setLocations(data.locations);
          } else {
            console.error('Invalid locations data structure:', data);
          }
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch locations:', response.status, errorText);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

  const fetchInternationalServices = useCallback(async (countryCode: string) => {
    console.log('Attempting to fetch international services for country:', countryCode);
    if (!state.apiKey) {
      console.log('No API key found');
      return;
    }

    setIsLoadingInternationalServices(true);
    try {
      const response = await fetch('/api/australia-post-international', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: state.apiKey,
          countryCode: countryCode,
          weight: '1',
        }),
      });

      console.log('Response from API:', response);

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched international services:', JSON.stringify(data, null, 2));
        if (data.services && Array.isArray(data.services.service)) {
          const servicesWithLocations = locations.flatMap(location =>
            data.services.service.map((service: any) => ({
              ...service,
              location: location.name,
              postalCode: location.zipCode || 'N/A',
              disabled: false,
            }))
          );
          setInternationalServices(servicesWithLocations);
        } else {
          console.error('Invalid data structure received:', data);
          setInternationalServices([]);
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch international services:', response.status, errorText);
        setInternationalServices([]);
      }
    } catch (error) {
      console.error('Error fetching international services:', error);
      setInternationalServices([]);
    } finally {
      setIsLoadingInternationalServices(false);
    }
  }, [state.apiKey, locations]);

  const handleCountryChange = useCallback((value: string) => {
    setSelectedCountry(value);
    fetchInternationalServices(value);
  }, [fetchInternationalServices]);

  const handleServiceToggle = useCallback((index: number, action: 'use' | 'hide') => {
    setInternationalServices((prevServices) =>
      prevServices.map((service, i) => 
        i === index ? { ...service, [action]: !service[action as keyof InternationalService] } : service
      )
    );
  }, []);

  const handleInternationalServiceDisableToggle = useCallback((index: number) => {
    setInternationalServices(prevServices => {
      const newServices = [...prevServices];
      newServices[index].disabled = !newServices[index].disabled;
      return newServices;
    });
  }, []);

  const renderInternationalServiceTable = () => (
    isLoadingInternationalServices ? (
      <Spinner accessibilityLabel="Loading international services" size="small" />
    ) : internationalServices.length > 0 ? (
      <DataTable
        columnContentTypes={['text', 'text', 'text', 'text']}
        headings={['Location', 'Location Details', 'Name', 'Disable']}
        rows={internationalServices.map((service, index) => [
          service.location,
          <Tooltip content={`Address not available for international services`}>
            <Text variant="bodyMd" as="span">
              {service.postalCode}
            </Text>
          </Tooltip>,
          <Tooltip content={`Code: ${service.code}`}>
            <Text variant="bodyMd" fontWeight="medium" as="span">
              {service.name}
            </Text>
          </Tooltip>,
          <Checkbox
            label="Disable"
            checked={service.disabled}
            onChange={() => handleInternationalServiceDisableToggle(index)}
            labelHidden
          />
        ])}
      />
    ) : (
      <Text as="p">No international services available.</Text>
    )
  );

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

  const handleToggleCarrier = useCallback(() => {
    setState(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
    setPopoverActive(false);
  }, []);

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
    <Button onClick={togglePopoverActive} disclosure variant="plain">
      Manage
    </Button>
  );

  // Update handleTestApiKey to use multiple locations
  const handleTestApiKey = useCallback(() => {
    if (!carrierConfig?.apiKey) return;

    fetcher.submit(
      {
        apiKey: carrierConfig.apiKey,
        locations: JSON.stringify(locations),
        rate: {
          destination: {
            postal_code: '2000', // Example postcode
            country: 'AU'
          },
          items: [{ grams: 1000 }] // Example weight
        },
        length: 22,
        width: 16,
        height: 7.7
      },
      { method: 'post', action: '/api/australia-post-lookup' }
    );
  }, [carrierConfig?.apiKey, locations]);

  // Update the fetchServices function to include location data
  useEffect(() => {
    const fetchServices = async () => {
      if (!state.apiKey) return;

      setIsLoadingServices(true);
      try {
        const response = await fetch(`/api/australia-post-services?apiKey=${encodeURIComponent(state.apiKey)}`);
        if (response.ok) {
          const data = await response.json();
          const servicesWithLocations = locations.flatMap(location =>
            (data.services || []).map((service: Service) => ({
              ...service,
              disabled: false,
              location: location.name,
              postalCode: location.zipCode
            }))
          );
          setServices(servicesWithLocations);
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
  }, [state.apiKey, locations]);

  const handleServiceDisableToggle = useCallback((index: number) => {
    setServices(prevServices => {
      const newServices = [...prevServices];
      newServices[index].disabled = !newServices[index].disabled;
      return newServices;
    });
  }, []);

  const handleShowApiKey = useCallback(() => {
    setShowApiKeySection(true);
    setPopoverActive(false);
  }, []);

  const handleHideApiKey = useCallback(() => {
    setShowApiKeySection(false);
  }, []);

  // Fetch carrier config on component mount
  useEffect(() => {
    const fetchCarrierConfig = async () => {
      if (typeof window === 'undefined') {
        const config = await getCarrierConfigByShopAndCarrier(Number(shop.id), carrierName);
        if (config) {
          setCarrierConfig(config);
          setState(prev => ({ ...prev, apiKey: config.apiKey || '' }));
        }
      } else {
        // Handle client-side rendering
        // You might want to fetch this data from an API endpoint instead
        console.log('Carrier config fetching is not available on the client side');
      }
    };

    fetchCarrierConfig();
  }, [shop.id, carrierName]);

  const actionItems: CustomActionItem[] = [
    {
      content: 'API Key',
      onAction: handleShowApiKey,
    },
    // ... other action items ...
  ];

  if (state.isEnabled) {
    actionItems.push({
      content: 'Disable',
      onAction: handleToggleCarrier,
      destructive: true,
    });
  } else {
    actionItems.unshift({
      content: 'Enable',
      onAction: handleToggleCarrier,
    });
  }

  // Add this console.log to check the shop object
  

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => {
      setSelectedTab(selectedTabIndex);
      console.log('Tab changed to:', selectedTabIndex);
      if (selectedTabIndex === 1) { // INTERNATIONAL tab
        // Set the country to United States and fetch services
        setSelectedCountry(DEFAULT_INTERNATIONAL_COUNTRY);
        fetchInternationalServices(DEFAULT_INTERNATIONAL_COUNTRY);
      }
    },
    [fetchInternationalServices],
  );

  const renderServiceTable = (services: Array<Service & { location: string; postalCode: string }>) => (
    isLoadingServices ? (
      <Spinner accessibilityLabel="Loading services" size="small" />
    ) : services.length > 0 ? (
      <DataTable
        columnContentTypes={['text', 'text', 'text', 'text']}
        headings={['Location', 'Location Details', 'Name', 'Disable']}
        rows={services.map((service, index) => {
          const locationData = locations.find(loc => loc.name === service.location);
          const zipCode = service.location === 'Shop location'
            ? (locationData?.zipCode || '4305')
            : (locationData?.zipCode || service.postalCode || 'N/A');

          return [
            service.location,
            <Tooltip content={locationData?.address || 'Address not available'}>
              <Text variant="bodyMd" as="span">
                {zipCode}
              </Text>
            </Tooltip>,
            <Tooltip content={`Code: ${service.code}`}>
              <Text variant="bodyMd" fontWeight="medium" as="span">
                {service.name}
              </Text>
            </Tooltip>,
            <Checkbox
              label="Disable"
              checked={service.disabled}
              onChange={() => handleServiceDisableToggle(index)}
              labelHidden
            />
          ];
        })}
      />
    ) : (
      <Text as="p">No services available.</Text>
    )
  );

  const tabs = [
    {
      id: 'domestic-services',
      content: 'Domestic',
      accessibilityLabel: 'Domestic services',
      panelID: 'domestic-services-content',
    },
    {
      id: 'international-services',
      content: 'International',
      accessibilityLabel: 'International services',
      panelID: 'international-services-content',
    },
  ];

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
                  items={actionItems}
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
                <Text as="h3" variant="headingMd">Rates by Location</Text>
                {locations.length > 0 ? (
                  locations.map(location => (
                    <div key={location.id}>
                      <Text as="h4" variant="headingSm">{location.name}</Text>
                      <DataTable
                        columnContentTypes={['text', 'text', 'text', 'numeric', 'text']}
                        headings={['Location', 'Postal Code', 'Service', 'Price', 'Estimated Delivery']}
                        rows={fetcher.data?.data?.rates
                          ?.filter((rate: { service_code: string }) => rate.service_code.startsWith(location.id))
                          ?.map((rate: { service_name: string; total_price: string; description: string }) => [
                            location.name,
                            location.zipCode,
                            rate.service_name,
                            `$${(parseFloat(rate.total_price) / 100).toFixed(2)}`,
                            rate.description || 'N/A'
                          ]) || []
                        }
                      />
                    </div>
                  ))
                ) : (
                  <Text as="p">No locations available</Text>
                )}
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
              Australia Post Services
            </Text>
            <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
              <LegacyCard.Section title={tabs[selectedTab].content}>
                {selectedTab === 0 ? (
                  renderServiceTable(services.filter(service => !service.code.startsWith('INT')))
                ) : (
                  <>
                    <Select
                      label="Select Country"
                      options={countryOptions}
                      onChange={handleCountryChange}
                      value={selectedCountry}
                    />
                    {renderInternationalServiceTable()}
                  </>
                )}
              </LegacyCard.Section>
            </Tabs>
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}
