import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { shopifyApi } from '@shopify/shopify-api';

export const action: ActionFunction = async ({ request }) => {
    console.log('Action function called in api.get-api-key.ts');
    console.log('Request method:', request.method);

    try {
        const formData = await request.formData();
        const shop = formData.get('shop') as string;
        const carrierName = formData.get('carrierName') as string;

        console.log('Received data:', { shop, carrierName });

        if (!shop || !carrierName) {
            console.log('Missing shop or carrierName');
            return json({ success: false, error: "Missing shop or carrierName" }, { status: 400 });
        }

        // Here, you would typically fetch the API key from your database or Shopify
        // For this example, we'll just return a dummy API key
        const apiKey = "dummy_api_key_" + shop + "_" + carrierName;

        console.log('API key retrieved successfully');
        return json({ success: true, apiKey });
    } catch (error) {
        console.error('Error in get-api-key action:', error);
        return json({ success: false, error: "Failed to retrieve API key" }, { status: 500 });
    }
};

// Optional: Add a loader function to handle GET requests
export const loader = async () => {
    console.log('Loader function called in api.get-api-key.ts');
    return new Response("This is a POST-only route", { status: 405 });
};
