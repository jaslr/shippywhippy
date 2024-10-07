import shopify from '../../../shopify.server';
import { Session } from '@shopify/shopify-api';

export async function getSessionToken(request: Request): Promise<string | null> {
    try {
        console.log('Attempting to authenticate admin request...');
        const { session } = await shopify.authenticate.admin(request);
        console.log('Authentication successful. Session:', session);

        if (session && session.accessToken) {
            console.log('Access token retrieved successfully');
            return session.accessToken;
        } else {
            console.log('No access token found in session');
            return null;
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        return null;
    }
}