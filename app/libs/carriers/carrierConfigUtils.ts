import { prisma } from '../../prisma';

export async function getCarrierConfigByShopAndCarrier(shopId: number, carrierName: string) {
    if (typeof window !== 'undefined') {
        console.error('Prisma Client cannot be used in browser environment');
        return null;
    }

    try {
        const carrierConfig = await prisma.carrierConfig.findFirst({
            where: {
                shop: { id: shopId },
                carrier: { name: carrierName },
            },
            include: {
                carrier: true,
            },
        });
        return carrierConfig;
    } catch (error) {
        console.error('Error fetching carrier config:', error);
        return null;
    }
}
