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

export async function updateCarrierStatus(shopName: string, carrierName: string, isActive: boolean): Promise<void> {
    try {
        const carrier = getCarrierByName(carrierName);
        if (!carrier) {
            throw new Error(`Carrier not found: ${carrierName}`);
        }

        let shop = await prisma.shop.findUnique({
            where: { username: shopName },
        });

        if (!shop) {
            // If shop doesn't exist, create it
            shop = await prisma.shop.create({
                data: {
                    username: shopName,
                    shopifyName: shopName,
                    shopifyUrl: `https://${shopName}`,
                    isActive: true,
                },
            });
            console.log(`Created new shop: ${shopName}`);
        }

        await prisma.carrierConfig.upsert({
            where: {
                shopId_carrierId: {
                    shopId: shop.id,
                    carrierId: parseInt(carrier.id),
                }
            },
            update: {
                isActive,
            },
            create: {
                shopId: shop.id,
                carrierId: parseInt(carrier.id),
                isActive,
            },
        });

        console.log(`Updated carrier status for ${carrierName} to ${isActive} for shop ${shopName}`);
    } catch (error) {
        console.error('Error updating carrier status:', error);
        if (error instanceof Error) {
            throw new Error(`Failed to update carrier status: ${error.message}`);
        } else {
            throw new Error('Failed to update carrier status: Unknown error');
        }
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
