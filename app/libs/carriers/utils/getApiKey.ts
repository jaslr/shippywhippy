import { prisma } from '../../../prisma';
import { getCarrierByName, CarrierStatus } from '../carrierlist';
import { Carrier } from '../types/carrier';

// Update the interface to include the defaultApiKey
interface CarrierWithDefaultApiKey extends Carrier {
  id: number;
  defaultApiKey: string;
}

function isCarrierWithDefaultApiKey(obj: any): obj is CarrierWithDefaultApiKey {
  return obj && typeof obj === 'object' && 'defaultApiKey' in obj;
}

export async function getApiKey(shop: string, carrierName: string): Promise<string> {
    const carrier = getCarrierByName(carrierName);
    if (!carrier) {
        throw new Error(`Carrier ${carrierName} not found`);
    }

    const shopRecord = await prisma.shop.findUnique({
        where: { username: shop },
        include: {
            carriers: {
                where: { carrier: { name: carrierName } },
                select: { apiKey: true }
            }
        }
    });

    if (!shopRecord) {
        throw new Error(`Shop ${shop} not found`);
    }

    const carrierConfig = shopRecord.carriers[0];
    
    if (carrierConfig && carrierConfig.apiKey) {
        return carrierConfig.apiKey;
    }

    const carrierRecord = await prisma.carrier.findUnique({
        where: { name: carrierName }
    });

    if (!carrierRecord || !isCarrierWithDefaultApiKey(carrierRecord)) {
        throw new Error(`Carrier ${carrierName} not found in database or has invalid structure`);
    }

    if (typeof carrierRecord.defaultApiKey !== 'string' || !carrierRecord.defaultApiKey) {
        throw new Error(`Default API key for carrier ${carrierName} not found or invalid`);
    }

    return carrierRecord.defaultApiKey;
}
