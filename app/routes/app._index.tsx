import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  List,
  Link,
  InlineStack,
  Banner,
  TextField,
  RadioButton,
  FormLayout,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";

const SHOP_QUERY = `#graphql
  query {
    shop {
      plan {
        displayName
        partnerDevelopment
      }
    }
  }
`;

const CARRIER_SERVICES_QUERY = `#graphql
  query {
    carrierServices(first: 250) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const shopResponse = await admin.graphql(SHOP_QUERY);
  const {
    data: { shop },
  } = await shopResponse.json();

  const carrierServicesResponse = await admin.graphql(CARRIER_SERVICES_QUERY);
  const {
    data: { carrierServices },
  } = await carrierServicesResponse.json();

  const isDevelopmentStore = shop.plan.partnerDevelopment || shop.plan.displayName === 'developer preview';
  const hasCarrierCalculatedShipping = carrierServices.edges.length > 0;

  return json({ isDevelopmentStore, hasCarrierCalculatedShipping });
};

export default function Index() {
  const { isDevelopmentStore, hasCarrierCalculatedShipping } = useLoaderData<typeof loader>();
  const shopify = useAppBridge();

  const [carriers, setCarriers] = useState([
    { name: "Australia Post", apiKey: "", enabled: false },
    { name: "Aramex (formerly Fastway)", apiKey: "", enabled: false },
    { name: "Sendle", apiKey: "", enabled: false },
    { name: "DHL", apiKey: "", enabled: false },
  ]);

  const handleApiKeyChange = (value: string, index: number) => {
    const updatedCarriers = [...carriers];
    updatedCarriers[index].apiKey = value;
    setCarriers(updatedCarriers);
  };

  const handleRadioChange = (checked: boolean, index: number) => {
    const updatedCarriers = [...carriers];
    updatedCarriers[index].enabled = checked;
    setCarriers(updatedCarriers);
  };

  return (
    <Page>
      <Banner title="Diagnostics" tone="info">
        <List>
          <List.Item>
            Carrier-Calculated Shipping: {hasCarrierCalculatedShipping ? 'Enabled' : 'Not enabled'}
          </List.Item>
          <List.Item>
            Development Store: {isDevelopmentStore ? 'Yes' : 'No'}
          </List.Item>
        </List>
      </Banner>
      <TitleBar title="Shippy Wippy" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Text as="h2" variant="headingMd">
                Carrier-Calculated Shipping Configuration
              </Text>
              <FormLayout>
                {carriers.map((carrier, index) => (
                  <Card key={carrier.name}>
                    <BlockStack gap="400">
                      <Text as="h3" variant="headingMd">
                        {carrier.name}
                      </Text>
                      <FormLayout>
                        <TextField
                          label="API Key"
                          value={carrier.apiKey}
                          onChange={(value) => handleApiKeyChange(value, index)}
                          autoComplete="off"
                        />
                        <RadioButton
                          label="Enable"
                          checked={carrier.enabled}
                          id={`${carrier.name}-enable`}
                          name={`${carrier.name}-status`}
                          onChange={(checked) => handleRadioChange(checked, index)}
                        />
                        <RadioButton
                          label="Disable"
                          checked={!carrier.enabled}
                          id={`${carrier.name}-disable`}
                          name={`${carrier.name}-status`}
                          onChange={(checked) => handleRadioChange(!checked, index)}
                        />
                      </FormLayout>
                    </BlockStack>
                  </Card>
                ))}
              </FormLayout>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          {/* Keep existing app template specs and next steps cards */}
        </Layout.Section>
      </Layout>
    </Page>
  );
}