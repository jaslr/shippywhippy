import '@shopify/shopify-app-remix/server/adapters/node';
import {
  LATEST_API_VERSION,
  shopifyApp,
} from '@shopify/shopify-app-remix/server';
import { PrismaSessionStorage } from '@shopify/shopify-app-session-storage-prisma';
import { prisma } from './prisma';

const isDev = process.env.NODE_ENV === 'development';

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  appUrl: process.env.SHOPIFY_APP_URL!,
  scopes: ['read_products', 'read_shop'],
  apiVersion: LATEST_API_VERSION,
  sessionStorage: new PrismaSessionStorage(prisma),
  isEmbeddedApp: true,
  cookieOptions: {
    sameSite: isDev ? 'lax' : 'none',
    secure: !isDev,
  },
  // Keep the CORS configuration here
  cors: {
    allowOrigins: ['https://admin.shopify.com'],
    allowHeaders: ['Authorization', 'Content-Type'],
  },
});

export default shopify;

export const authenticate = shopify.authenticate;
