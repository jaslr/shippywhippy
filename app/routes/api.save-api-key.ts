import { json, type ActionFunctionArgs } from "@remix-run/node";
import shopify from "../shopify.server";
import { prisma } from "../prisma";

export const loader = async () => {
    console.log('Loader function called in save-api-key.ts');
    return new Response("This is a POST-only route", { status: 405 });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    console.log('Action function called in save-api-key.ts');
    console.log('Request method:', request.method);

    try {
        const { admin, session } = await shopify.authenticate.admin(request);
        console.log('Session authenticated:', session.shop);

        const formData = await request.formData();
        console.log('Form data:', Object.fromEntries(formData));

        const carrierName = formData.get("carrierName") as string;
        const apiKey = formData.get("apiKey") as string;
        console.log('Received data:', { carrierName, apiKey: apiKey ? '[REDACTED]' : 'Not provided' });

        if (!carrierName || !apiKey) {
            console.log('Missing carrierName or apiKey');
            return json({ error: "Missing carrierName or apiKey" }, { status: 400 });
        }

        const carrier = await prisma.carrier.findUnique({
            where: { name: carrierName },
        });

        if (!carrier) {
            console.log('Carrier not found:', carrierName);
            return json({ error: 'Carrier not found' }, { status: 400 });
        }

        console.log('Carrier found:', carrier);

        const shop = await prisma.shop.findUnique({
            where: { username: session.shop },
        });

        if (!shop) {
            console.log('Shop not found:', session.shop);
            return json({ error: 'Shop not found' }, { status: 400 });
        }

        console.log('Shop found:', shop);

        console.log('Attempting to upsert CarrierConfig');
        const result = await prisma.carrierConfig.upsert({
            where: {
                shopId_carrierId: {
                    shopId: shop.id,
                    carrierId: carrier.id,
                }
            },
            update: {
                apiKey,
                isActive: true,
            },
            create: {
                shopId: shop.id,
                carrierId: carrier.id,
                apiKey,
                isActive: true,
            },
        });

        console.log('CarrierConfig upsert result:', result);
        return json({ success: true, result });
    } catch (error) {
        console.error('Error in action function:', error);
        return json({ error: 'Failed to save API key', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
};
