import { json } from '@remix-run/node';
import prisma from '~/db.server';

export async function action({ request }: { request: Request }) {
    const { carrierName, useDescription, shopUrl } = await request.json();

    console.log('Received request data:', { carrierName, useDescription, shopUrl });

    try {
        if (!shopUrl) {
            return json({ success: false, error: `Invalid shop URL: ${shopUrl}` }, { status: 400 });
        }

        // Find the shop by shopifyUrl
        const shop = await prisma.shop.findFirst({
            where: { shopifyUrl: shopUrl },
        });

        if (!shop) {
            return json({ success: false, error: `Shop not found: ${shopUrl}` }, { status: 404 });
        }

        // Find the carrier by name
        const carrier = await prisma.carrier.findUnique({
            where: { name: carrierName },
        });

        if (!carrier) {
            return json({ success: false, error: `Carrier not found: ${carrierName}` }, { status: 404 });
        }

        // Update the CarrierConfig
        const updatedConfig = await prisma.carrierConfig.updateMany({
            where: {
                shopId: shop.id,
                carrierId: carrier.id,
            },
            data: {
                useDescription: useDescription
            },
        });

        console.log('Update result:', updatedConfig);

        if (updatedConfig.count === 0) {
            return json({ success: false, error: `CarrierConfig not found or not updated for shop: ${shopUrl} and carrier: ${carrierName}` }, { status: 404 });
        }

        return json({ success: true, data: updatedConfig });
    } catch (error: unknown) {
        console.error('Error updating carrier config:', error);
        return json({ success: false, error: `Failed to update carrier configuration: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
    }
}
