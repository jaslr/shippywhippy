import '@shopify/shopify-app-remix/server/adapters/node';
import {
  LATEST_API_VERSION,
  shopifyApp,
  DeliveryMethod,
} from '@shopify/shopify-app-remix/server';
import { PrismaSessionStorage } from '@shopify/shopify-app-session-storage-prisma';
import { prisma } from './prisma';

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  appUrl: process.env.SHOPIFY_APP_URL!,
  scopes: ['read_products', 'read_shop'],
  apiVersion: LATEST_API_VERSION,
  sessionStorage: new PrismaSessionStorage(prisma),
  isEmbeddedApp: true,
  auth: {
    path: '/api/auth',
    callbackPath: '/api/auth/callback',
  },
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: '/api/webhooks',
      callback: async (topic, shop, body, webhookId) => {
        console.log('App uninstalled from shop:', shop);
        // Implement your APP_UNINSTALLED webhook logic here
      },
    },
  },
});

export default shopify;
export const authenticate = shopify.authenticate;

