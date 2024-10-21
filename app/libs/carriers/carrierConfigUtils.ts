import { prisma } from '../../prisma';

export async function getCarrierConfigByShopAndCarrier(shopId: number, carrierName: string) {
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
}
