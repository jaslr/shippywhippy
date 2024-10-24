import { json, LoaderFunction } from "@remix-run/node";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  List,
  Banner,
  FormLayout
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useLoaderData, useRouteError } from "@remix-run/react";
import { getSessionToken } from "../libs/carriers/utils/sessionToken";
import { boundary } from "@shopify/shopify-app-remix/server";
import { HeadersFunction } from "@remix-run/node";
import { CarrierUptimeCheck } from "../components/carriers/shared/CarrierUptimeCheck";
import { AdminApiContext } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients";
import { AustraliaPostCard } from "../components/carriers/australia-post/AustraliaPostCard";
import { AramexCard } from "../components/carriers/aramex/AramexCard";

const SHOP_QUERY = `#graphql
  query {
    shop {
      id
      url
      plan {
        displayName
        partnerDevelopment
      }
    }
  }
`;



async function registerCarrierService(admin: AdminApiContext) {
  try {
    const appUrl = process.env.SHOPIFY_APP_URL;
    const mutation = `
      mutation RegisterCarrierService {
        carrierServiceCreate(input: {
          name: "Shippy Whippy",
          active: true,
          callbackUrl: "${appUrl}/api/carrier-service",
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
      }
    `;

    const response = await admin.graphql(mutation);
    const result = await response.json();
    console.log("Carrier service registered:", result);
    return result.data.carrierServiceCreate.carrierService;
  } catch (error) {
    console.error("Error registering carrier service:", error);
    return null;
  }
}

async function getExistingCarrierService(admin: AdminApiContext) {
  try {
    const query = `
      query {
        carrierServices(first: 1, query: "Shippy Whippy") {
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
    `;

    const response = await admin.graphql(query);
    const result = await response.json();
    console.log("Existing carrier service:", result);
    return result.data.carrierServices.edges[0]?.node;
  } catch (error) {
    console.error("Error getting existing carrier service:", error);
    return null;
  }
}

async function updateCarrierService(admin: AdminApiContext, id: string) {
  try {
    const mutation = `
      mutation UpdateCarrierService($id: ID!, $input: CarrierServiceUpdateInput!) {
        carrierServiceUpdate(id: $id, input: $input) {
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
      }
    `;

    const variables = {
      id: id,
      input: {
        active: true,
        supportsServiceDiscovery: true
      }
    };

    const response = await admin.graphql(
      mutation,
      {
        variables: variables,
      }
    );
    const result = await response.json();
    console.log("Carrier service updated:", result);
    return result.data.carrierServiceUpdate.carrierService;
  } catch (error) {
    console.error("Error updating carrier service:", error);
    return null;
  }
}

export const loader: LoaderFunction = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const shopResponse = await admin.graphql(SHOP_QUERY);
  const {
    data: { shop },
  } = await shopResponse.json();

  const isDevelopmentStore = shop.plan.partnerDevelopment || shop.plan.displayName === 'developer preview';

  const sessionToken = await getSessionToken(request);

  let existingCarrierService = await getExistingCarrierService(admin);

  if (!existingCarrierService) {
    existingCarrierService = await registerCarrierService(admin);
  } else if (!existingCarrierService.active) {
    // Update the carrier service if it's not active
    existingCarrierService = await updateCarrierService(admin, existingCarrierService.id);
  }

  const hasCarrierCalculatedShipping = !!existingCarrierService;

  await fetch(`${process.env.APP_URL}/api/shop-info`);

  return json({
    isDevelopmentStore,
    hasCarrierCalculatedShipping,
    sessionToken,
    carrierService: existingCarrierService,
    shop: {
      id: shop.id,
      shopifyUrl: shop.url
    }
  });
};

type LoaderData = {
  isDevelopmentStore: boolean;
  hasCarrierCalculatedShipping: boolean;
  sessionToken: string;
  carrierService: any;
  shop: {
    id: string;
    shopifyUrl: string;
  };
};

export default function Index() {
  const { isDevelopmentStore, hasCarrierCalculatedShipping, sessionToken, carrierService, shop } = useLoaderData<LoaderData>();

  return (
    <Page>
      <BlockStack gap="800">
        <Banner title="Diagnostics" tone="info">
          <List>
            <List.Item>
              Carrier-Calculated Shippings: {hasCarrierCalculatedShipping ? 'Enabled' : 'Not enabled'}
            </List.Item>
            <List.Item>
              Development Store: {isDevelopmentStore ? 'Yes' : 'No'}
            </List.Item>
            <List.Item>
              Session Token: {sessionToken ? 'Retrieved' : 'Not available'}
            </List.Item>
            <List.Item>
              Shop: {JSON.stringify(shop)}
            </List.Item>
            <List.Item>
              Shippy Whippy Carrier Service: {carrierService ? 'Installed' : 'Not installed'}
            </List.Item>
            {carrierService && (
              <List.Item>
                Carrier Service Details:
                <ul>
                  <li>Name: {carrierService.name}</li>
                  <li>Active: {carrierService.active ? 'Yes' : 'No'}</li>
                  <li>Callback URL: {carrierService.callbackUrl}</li>
                  <li>Supports Service Discovery: {carrierService.supportsServiceDiscovery ? 'Yes' : 'No'}</li>
                </ul>
              </List.Item>
            )}
          </List>
        </Banner>
        <TitleBar title="Shippy Whippy" />
        <Layout>
          <Layout.Section>
            <BlockStack gap="500">              
              <AustraliaPostCard shop={shop} carrierName="Australia Post" statusURL="/api/carrier-status" apiKeyEnvVar="SHIPPING_API_KEY_AUSTRALIA_POST" defaultApiKey="SHIPPING_API_KEY_AUSTRALIA_POST" />
              <AramexCard shop={shop} carrierName="Aramex" statusURL="/api/carrier-status" apiKeyEnvVar="SHIPPING_API_KEY_ARAMEX" defaultApiKey="SHIPPING_API_KEY_ARAMEX" />
            </BlockStack>
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
