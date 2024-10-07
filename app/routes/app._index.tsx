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
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import { AustraliaPost } from "../components/carriers/australia-post";
import { Aramex } from "../components/carriers/aramex";
import { getSessionToken } from "../libs/carriers/utils/sessionToken";

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

  const sessionToken = await getSessionToken(request);

  return json({ isDevelopmentStore, hasCarrierCalculatedShipping, sessionToken });
};

export default function Index() {
  const { isDevelopmentStore, hasCarrierCalculatedShipping, sessionToken } = useLoaderData<typeof loader>();

  return (
    <Page>
      <BlockStack gap="800">
        <Banner title="Diagnostics" tone="info">
          <List>
            <List.Item>
              Carrier-Calculated Shipping: {hasCarrierCalculatedShipping ? 'Enabled' : 'Not enabled'}
            </List.Item>
            <List.Item>
              Development Store: {isDevelopmentStore ? 'Yes' : 'No'}
            </List.Item>
            <List.Item>
              Session Token: {sessionToken ? 'Retrieved' : 'Not available'}
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
                  <AustraliaPost />
                  <Aramex />
                </FormLayout>
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            {/* Keep existing app template specs and next steps cards */}
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}