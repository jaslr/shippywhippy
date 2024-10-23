import '@shopify/shopify-app-remix/server/adapters/node';
import {
  LATEST_API_VERSION,
  shopifyApp,
  DeliveryMethod,  
} from '@shopify/shopify-app-remix/server';

import { PrismaSessionStorage } from '@shopify/shopify-app-session-storage-prisma';
import { prisma } from './prisma';
import { restResources } from "@shopify/shopify-api/rest/admin/2023-04";
import { shopifyApi, Session } from '@shopify/shopify-api';


// Add type assertions or validation at the top
const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecretKey = process.env.SHOPIFY_API_SECRET;
const appUrl = process.env.SHOPIFY_APP_URL;

if (!apiKey || !apiSecretKey || !appUrl) {
  throw new Error(
    'Missing required environment variables SHOPIFY_API_KEY, SHOPIFY_API_SECRET, or SHOPIFY_APP_URL'
  );
}

console.log('Initializing Shopify app with environment variables:');
console.log('SHOPIFY_API_KEY:', process.env.SHOPIFY_API_KEY);
console.log('SHOPIFY_API_SECRET:', process.env.SHOPIFY_API_SECRET ? '[REDACTED]' : 'Not set');
console.log('SHOPIFY_APP_URL:', process.env.SHOPIFY_APP_URL);

async function fetchAndLogLocations(shop: string, accessToken: string) {
  const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY!,
    apiSecretKey: process.env.SHOPIFY_API_SECRET!,
    scopes: ['read_products', 'write_products', 'read_shipping', 'write_shipping', 'read_locations'],
    hostName: process.env.SHOPIFY_APP_URL!.replace(/https?:\/\//, ''),
    apiVersion: LATEST_API_VERSION,
    isEmbeddedApp: true,
  });

  const session = new Session({
    id: `${shop}_${Date.now()}`,
    shop: shop,
    state: 'active',
    isOnline: true,
    accessToken: accessToken,
  });

  const client = new shopify.clients.Graphql({ session });
  
  const query = `
    query {
      locations(first: 10) {
        edges {
          node {
            id
            name
            address {
              address1
              address2
              city
              provinceCode
              zip
              countryCode
            }
            isActive
            fulfillsOnlineOrders
          }
        }
      }
    }
  `;

  try {
    const response = await client.query<ShopifyGraphQLResponse<LocationQueryResponse>>({ data: query });
    
    if (response.body && response.body.data && response.body.data.locations.edges.length > 0) {
      console.log('Locations for shop', shop, ':', JSON.stringify(response.body, null, 2));

      const primaryLocation = response.body.data.locations.edges[0].node;
      const username = shop.split('.')[0]; // Assuming the shop name is the subdomain
      
      // Update shop
      await prisma.shop.update({
        where: { username: username },
        data: { postalCode: primaryLocation.address.zip } as any, // Use 'as any' to bypass type checking
      });
      console.log('Updated postal code for shop', shop, 'to', primaryLocation.address.zip);

      // Create or update location
      await prisma.location.upsert({
        where: { shopifyLocationId: primaryLocation.id },
        update: {
          name: primaryLocation.name,
          address1: primaryLocation.address.address1,
          address2: primaryLocation.address.address2 || null,
          city: primaryLocation.address.city,
          province: primaryLocation.address.provinceCode,
          country: primaryLocation.address.countryCode,
          zip: primaryLocation.address.zip,
        },
        create: {
          shop: { connect: { username: username } },
          shopifyLocationId: primaryLocation.id,
          name: primaryLocation.name,
          address1: primaryLocation.address.address1,
          address2: primaryLocation.address.address2 || null,
          city: primaryLocation.address.city,
          province: primaryLocation.address.provinceCode,
          country: primaryLocation.address.countryCode,
          zip: primaryLocation.address.zip,
        },
      });
      console.log('Updated or created Location for shop', shop);
    } else {
      console.log('No locations found for shop', shop);
    }
  } catch (error) {
    console.error('Error fetching locations for shop', shop, ':', error);
  }
}

interface AppInstalledWebhookBody {
  shop_domain: string;
  admin_graphql_api_id: string;
}

interface ShopData {
  username: string;
  shopifyUrl: string;
  shopifyName: string;
}

const createShopRecord = async (shopData: ShopData) => {
  console.log('📝 Creating shop record:', shopData);
  
  return await prisma.shop.upsert({
    where: { username: shopData.username },
    update: {
      shopifyUrl: shopData.shopifyUrl,
      shopifyName: shopData.username,
      isActive: true,
      installedAt: new Date(),
      uninstalledAt: null
    },
    create: {
      ...shopData,
      isActive: true,
      daysActive: 0
    }
  });
};

const linkSessionToShop = async (sessionId: string, shopId: number) => {
  console.log('🔗 Linking session to shop:', { sessionId, shopId });
  
  return await prisma.session.update({
    where: { id: sessionId },
    data: { shopId }
  });
};

const verifyShopCreation = async (username: string) => {
  console.log('🔍 Verifying shop creation for:', username);
  
  const shop = await prisma.shop.findUnique({
    where: { username },
    include: { sessions: true }
  });
  
  console.log('✅ Shop verification result:', shop);
  return shop;
};

const shopify = shopifyApp({
  apiKey,
  apiSecretKey,
  appUrl,
  scopes: ['write_products', 'write_shipping', 'read_locations'],
  authPathPrefix: '/auth',
  sessionStorage: new PrismaSessionStorage(prisma),
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
      callback: async (topic, shop, body, webhookId) => {
        try {
          // Find shop record
          const shopRecord = await prisma.shop.findFirst({
            where: { username: shop }
          });

          if (!shopRecord) {
            console.error('❌ Shop not found:', shop);
            return;
          }

          // Update shop record
          await prisma.shop.update({
            where: { id: shopRecord.id },
            data: {
              uninstalledAt: new Date()
            }
          });

          console.log('✅ Shop record updated:', shopRecord);

          // Update session
          await prisma.session.updateMany({
            where: { shop },
            data: { shopId: shopRecord.id }
          });

          console.log('✅ Session linked to shop');
        } catch (error) {
          console.error('❌ Error updating shop record:', error);
        }
      }
    }
  },
  hooks: {
    afterAuth: async (ctx) => {
      const { session } = ctx;
      
      try {
        const username = session.shop.split('.')[0];
        const shopRecord = await prisma.shop.upsert({
          where: { username },
          create: {
            username,
            shopifyName: username,
            shopifyUrl: `https://${session.shop}`,
            isActive: true,
            installedAt: new Date(),
            daysActive: 0
          },
          update: {
            isActive: true,
            installedAt: new Date(),
            uninstalledAt: null
          }
        });

        console.log('✅ Shop record created in afterAuth:', shopRecord);

        // Link session to shop
        await prisma.session.update({
          where: { id: session.id },
          data: { shopId: shopRecord.id }
        });

      } catch (error) {
        console.error('❌ Error in afterAuth hook:', error);
      }
    }
  }
});

console.log('Shopify app initialized successfully');

export default shopify;
export const authenticate = shopify.authenticate;

interface ShopifyGraphQLResponse<T> {
  data: T;
  extensions: Record<string, unknown>;
}

interface LocationQueryResponse {
  locations: {
    edges: Array<{
      node: {
        id: string;
        name: string;
        address: {
          address1: string;
          address2: string | null;
          city: string;
          provinceCode: string;
          zip: string;
          countryCode: string;
        };
        isActive: boolean;
        fulfillsOnlineOrders: boolean;
      };
    }>;
  };
}
