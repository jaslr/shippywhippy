import { json } from '@remix-run/node';
import prisma from '~/db.server';

export async function action({ request }: { request: Request }) {
    const { carrierName, useDescription, shopId } = await request.json();

    try {
        const shop = await prisma.shop.findUnique({
            where: { id: shopId },
        });

        if (!shop) {
            return json({ success: false, error: 'Shop not found' }, { status: 404 });
        }

        const carrier = await prisma.carrier.findUnique({
            where: { name: carrierName },
        });

        if (!carrier) {
            return json({ success: false, error: 'Carrier not found' }, { status: 404 });
        }

        const updatedConfig = await prisma.carrierConfig.update({
            where: {
                shopId_carrierId: {
                    shopId: shop.id,
                    carrierId: carrier.id,
                },
            },
            data: {
                useDescription: useDescription
            },
        });

        console.log('Updated carrier config:', updatedConfig);

        return json({ success: true, data: updatedConfig });
    } catch (error) {
        console.error('Error updating carrier config:', error);
        return json({ success: false, error: 'Failed to update carrier configuration' }, { status: 500 });
    }
}
