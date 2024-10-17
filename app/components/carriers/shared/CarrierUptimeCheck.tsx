import React, { useState, useEffect } from 'react';
import { Banner, IndexTable, useIndexResourceState, Spinner, Icon, Tooltip, Button, Text } from '@shopify/polaris';
import { CheckCircleIcon, XCircleIcon } from '@shopify/polaris-icons';
import { CarrierStatus, carrierList, updateCarrierStatuses } from '../../../libs/carriers/carrierlist';
import './CarrierUptimeCheck.css'; // Make sure to create this CSS file

export function CarrierUptimeCheck() {
  const [carrierStatuses, setCarrierStatuses] = useState<CarrierStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    const checkCarrierStatus = async () => {
      const now = new Date();
      if (!lastChecked || now.getTime() - lastChecked.getTime() >= 60000) {
        setIsLoading(true);
        const updatedStatuses = await updateCarrierStatuses();
        setCarrierStatuses(updatedStatuses);
        setLastChecked(now);
        setIsLoading(false);
      }
    };

    checkCarrierStatus();
    const intervalId = setInterval(checkCarrierStatus, 60000);

    return () => clearInterval(intervalId);
  }, [lastChecked]);

  const resourceName = {
    singular: 'carrier',
    plural: 'carriers',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(carrierStatuses);

  if (isLoading && !lastChecked) {
    return <Spinner accessibilityLabel="Checking carrier status" size="small" />;
  }

  const formatLastChecked = (date: Date) => {
    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const rowMarkup = carrierStatuses.map(
    ({ id, name, isUp, statusURL }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell className="status-cell">
          <Tooltip content={isUp ? 'Up' : 'Down'}>
            <Icon
              source={isUp ? CheckCircleIcon : XCircleIcon}
              tone={isUp ? 'success' : 'critical'}
            />
          </Tooltip>
        </IndexTable.Cell>
        <IndexTable.Cell>{name}</IndexTable.Cell>
        <IndexTable.Cell>
          {statusURL && (
            <Button variant="plain" url={statusURL} external>
              View Carrier Uptimes
            </Button>
          )}
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Banner title="Carrier Uptime Check" tone="info">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Text variant="bodyMd" as="p">
          Last checked: {lastChecked ? formatLastChecked(lastChecked) : 'Never'}
        </Text>
      </div>
      <IndexTable
        resourceName={resourceName}
        itemCount={carrierStatuses.length}
        selectedItemsCount={
          allResourcesSelected ? 'All' : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={[
          { title: 'Status', hidden: true },
          { title: 'Carrier' },
          { title: '', hidden: true },
        ]}
        selectable={false}
      >
        {rowMarkup}
      </IndexTable>
    </Banner>
  );
}

