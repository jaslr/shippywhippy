import { Carrier } from '../types/carrier';
import { prisma } from '../../../prisma';
import { getCarrierByName } from '../carrierlist';

export function validateApiKey(apiKey: string): boolean {
    return apiKey.length > 0;
}

export function formatCarrierName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export function getActiveCarriers(carriers: Carrier[]): Carrier[] {
    return carriers.filter(carrier => carrier.isActive);
}

export async function updateCarrierStatus(shop: string, carrierName: string, isActive: boolean): Promise<void> {
    try {
        const carrier = getCarrierByName(carrierName);
        if (!carrier) {
            throw new Error('Carrier not found');
        }

        const shopRecord = await prisma.shop.findUnique({
            where: { username: shop },
        });

        if (!shopRecord) {
            throw new Error('Shop not found');
        }

        await prisma.carrierConfig.upsert({
            where: {
                shopId_carrierId: {
                    shopId: shopRecord.id,
                    carrierId: parseInt(carrier.id),
                }
            },
            update: {
                isActive,
            },
            create: {
                shopId: shopRecord.id,
                carrierId: parseInt(carrier.id),
                isActive,
            },
        });
    } catch (error) {
        console.error('Error updating carrier status:', error);
        throw new Error('Failed to update carrier status');
    }
}

export async function saveApiKey(shop: string, carrierName: string, apiKey: string): Promise<void> {
    try {
        const carrier = getCarrierByName(carrierName);
        if (!carrier) {
            throw new Error('Carrier not found');
        }

        const shopRecord = await prisma.shop.findUnique({
            where: { username: shop },
        });

        if (!shopRecord) {
            throw new Error('Shop not found');
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
                isActive: false,
            },
        });
    } catch (error) {
        console.error('Error saving API key:', error);
        throw new Error('Failed to save API key');
    }
}
