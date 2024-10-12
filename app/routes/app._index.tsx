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
import { useLoaderData, useRouteError, useOutletContext } from "@remix-run/react";
import { AustraliaPost } from "../components/carriers/australia-post";
import { Aramex } from "../components/carriers/aramex";
import { getSessionToken } from "../libs/carriers/utils/sessionToken";
import { boundary } from "@shopify/shopify-app-remix/server";
import { HeadersFunction } from "@remix-run/node";
import { CarrierUptimeCheck } from "../components/carriers/shared/CarrierUptimeCheck";
import { ShopifyRestResources } from "@shopify/shopify-api";
import { AdminApiContext } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients";
import { GraphQLClient } from '@shopify/graphql-client';

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

async function registerCarrierService(admin: AdminApiContext) {
  try {
    const response = await admin.graphql(
      `mutation RegisterCarrierService {
        carrierServiceCreate(input: {
          active: true,
          callbackUrl: "${process.env.SHOPIFY_APP_URL}/api/carrier-service",
          name: "Shippy Wippy",
          supportsServiceDiscovery: true
        }) {
          carrierService {
            id
            name
            active
            callbackUrl
            supportsServiceDiscovery
          }
          userErrors {
            field
            message
          }
        }
      }`
    );
    const result = await response.json();
    console.log("Carrier service registered:", result);
  } catch (error) {
    console.error("Error registering carrier service:", error);
  }
}

export const loader = async ({ request }: { request: Request }) => {
  const { admin, session } = await authenticate.admin(request);
  await registerCarrierService(admin);

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

  const carrierServiceResponse = await admin.graphql(`
    query {
      carrierServices(first: 1, query: "Shippy Wippy") {
        edges {
          node {
            id
            name
            active
            callbackUrl
          }
        }
      }
    }
  `);
  const carrierServiceData = await carrierServiceResponse.json();
  const carrierService = carrierServiceData.data.carrierServices.edges[0]?.node;

  return json({ isDevelopmentStore, hasCarrierCalculatedShipping, sessionToken, carrierService });
};

export default function Index() {
  const { isDevelopmentStore, hasCarrierCalculatedShipping, sessionToken, carrierService } = useLoaderData<typeof loader>();
  const { shop } = useOutletContext<{ shop: string }>();

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
            <List.Item>
              Shop: {shop}
            </List.Item>
            <List.Item>
              Shippy Wippy Carrier Service: {carrierService ? 'Installed' : 'Not installed'}
            </List.Item>
            {carrierService && (
              <List.Item>
                Carrier Service Details: 
                <ul>
                  <li>Name: {carrierService.name}</li>
                  <li>Active: {carrierService.active ? 'Yes' : 'No'}</li>
                  <li>Callback URL: {carrierService.callbackUrl}</li>
                </ul>
              </List.Item>
            )}
          </List>
        </Banner>
        <CarrierUptimeCheck />
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

// Add error boundary and headers
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
