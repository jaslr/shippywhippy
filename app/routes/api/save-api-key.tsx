import { json, type ActionFunctionArgs } from "@remix-run/node";
import shopify from "../../shopify.server";
import { prisma } from "../../prisma";
import { getCarrierByName } from "../../libs/carriers/carrierlist";

export const action = async ({ request }: ActionFunctionArgs) => {
    console.log('Received request to save API key');
    console.log('Request method:', request.method);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));

    try {
        const { admin, session } = await shopify.authenticate.admin(request);

        if (!session) {
            console.log('No session found');
            return json({ error: "No session found" }, { status: 401 });
        }

        const formData = await request.formData();
        const carrierName = formData.get("carrierName") as string;
        const apiKey = formData.get("apiKey") as string;

        console.log('Received data:', { carrierName, apiKey: apiKey ? '[REDACTED]' : 'Not provided' });

        const carrier = getCarrierByName(carrierName);
        if (!carrier) {
            console.log('Carrier not found:', carrierName);
            return json({ error: 'Carrier not found' }, { status: 400 });
        }

        const shopRecord = await prisma.shop.findUnique({
            where: { username: session.shop },
        });

        if (!shopRecord) {
            console.log('Shop not found:', session.shop);
            return json({ error: 'Shop not found' }, { status: 400 });
        }

        await prisma.carrierConfig.upsert({
            where: {
                shopId_carrierId: {
                    shopId: shopRecord.id,
                    carrierId: parseInt(carrier.id),
                }
            },
            update: {
                apiKey,
            },
            create: {
                shopId: shopRecord.id,
                carrierId: parseInt(carrier.id),
                apiKey,
            },
        });

        console.log('API key saved successfully');
        return json({ success: true });
    } catch (error: unknown) {
        console.error('Error saving API key:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return json({ error: 'Failed to save API key', details: errorMessage }, { status: 500 });
    }
};
