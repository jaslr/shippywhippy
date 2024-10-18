import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { prisma } from "../prisma";
import shopify from "../shopify.server";

export const action: ActionFunction = async ({ request }) => {
    console.log('Action function called in api.get-api-key.ts');
    console.log('Request method:', request.method);

    try {
        const { admin, session } = await shopify.authenticate.admin(request);
        console.log('Session authenticated:', session.shop);

        const formData = await request.formData();
        const carrierName = formData.get('carrierName') as string;

        console.log('Received data:', { shop: session.shop, carrierName });

        if (!session.shop || !carrierName) {
            console.log('Missing shop or carrierName');
            return json({ success: false, error: "Missing shop or carrierName" }, { status: 400 });
        }

        const shop = await prisma.shop.findUnique({
            where: { username: session.shop },
        });

        if (!shop) {
            console.log('Shop not found:', session.shop);
            return json({ success: false, error: "Shop not found" }, { status: 404 });
        }

        const carrier = await prisma.carrier.findUnique({
            where: { name: carrierName },
        });

        if (!carrier) {
            console.log('Carrier not found:', carrierName);
            return json({ success: false, error: "Carrier not found" }, { status: 404 });
        }

        const carrierConfig = await prisma.carrierConfig.findUnique({
            where: {
                shopId_carrierId: {
                    shopId: shop.id,
                    carrierId: carrier.id,
                }
            },
        });

        if (!carrierConfig || !carrierConfig.apiKey) {
            console.log('API key not found for carrier:', carrierName);
            return json({ success: false, error: "API key not found" }, { status: 404 });
        }

        console.log('API key retrieved successfully');
        return json({ success: true, apiKey: carrierConfig.apiKey });
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
