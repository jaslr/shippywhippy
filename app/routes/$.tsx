import { LoaderFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import shopify from '~/shopify.server';
import { useRouteError } from '@remix-run/react';
import { boundary } from '@shopify/shopify-app-remix/server';

export async function loader({ request }: LoaderFunctionArgs) {
  console.log("Auth route: Handling OAuth request");
  try {
    const authResult = await shopify.authenticate.admin(request);

    if (authResult instanceof Response) {
      return authResult;
    }

    const { session } = authResult;

    if (session) {
      console.log("Auth route: OAuth process completed successfully");
      console.log("Session:", session);

      // Redirect to the app's main page after successful authentication
      return redirect('/app');
    }

    // If no session, continue with the OAuth flow
    const url = new URL(request.url);
    if (url.searchParams.get("embedded") === "1") {
      const shop = url.searchParams.get("shop");
      if (shop) {
        const host = url.searchParams.get("host");
        const apiKey = process.env.SHOPIFY_API_KEY;
        if (!apiKey) {
          throw new Error("SHOPIFY_API_KEY is not set");
        }
        const exitIframeUrl = `https://${shop}/admin/apps/${apiKey}${host ? `?host=${host}` : ''}`;
        return redirect(exitIframeUrl);
      }
    }
    // Redirect to the app's main page after successful authentication
    return redirect('/app');
  } catch (error) {
    console.error("Auth route: OAuth error", error);
    throw error;
  }
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = boundary.headers;
