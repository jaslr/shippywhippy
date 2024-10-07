import shopify from '../../../shopify.server';
import { Session } from '@shopify/shopify-api';

export async function getSessionToken(request: Request): Promise<string | null> {
    try {
        const { session } = await shopify.authenticate.admin(request);
        if (session && session.accessToken) {
            return session.accessToken;
        }
        return null;
    } catch (error) {
        console.error('Error getting session token:', error);
        return null;
    }
}