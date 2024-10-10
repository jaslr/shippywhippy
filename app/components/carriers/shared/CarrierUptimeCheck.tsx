import React, { useState, useEffect } from 'react';
import { Banner, IndexTable, useIndexResourceState, Spinner, Icon, Tooltip } from '@shopify/polaris';
import { CheckCircleIcon, XCircleIcon } from '@shopify/polaris-icons';
import './CarrierUptimeCheck.css'; // Make sure to create this CSS file

type CarrierStatus = {
  id: string;
  name: string;
  isUp: boolean;
};

export function CarrierUptimeCheck() {
  const [carrierStatuses, setCarrierStatuses] = useState<CarrierStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkCarrierStatus = async () => {
      // Simulate API calls to check carrier status
      const statuses = [
        { id: '1', name: 'Australia Post', isUp: Math.random() > 0.5 },
        { id: '2', name: 'Aramex', isUp: Math.random() > 0.5 },
      ];
      setCarrierStatuses(statuses);
      setIsLoading(false);
    };

    checkCarrierStatus();
  }, []);

  const resourceName = {
    singular: 'carrier',
    plural: 'carriers',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(carrierStatuses);

  if (isLoading) {
    return <Spinner accessibilityLabel="Checking carrier status" size="small" />;
  }

  const rowMarkup = carrierStatuses.map(
    ({ id, name, isUp }, index) => (
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
      </IndexTable.Row>
    ),
  );

  return (
    <Banner title="Carrier Uptime Check" tone="info">
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
        ]}
        selectable={false}
      >
        {rowMarkup}
      </IndexTable>
    </Banner>
  );
}

