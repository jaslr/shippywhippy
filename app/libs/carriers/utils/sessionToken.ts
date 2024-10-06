import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";

export async function getSessionTokenFromApp(app: ReturnType<typeof useAppBridge>) {
    try {
        // Cast the app to any to bypass the type check
        const sessionToken = await getSessionToken(app as any);
        return sessionToken;
    } catch (error) {
        console.error('Error getting session token:', error);
        return null;
    }
}