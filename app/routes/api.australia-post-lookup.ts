import { json, type ActionFunction } from '@remix-run/node';
import { prisma } from '~/prisma';
import type { CarrierConfig } from '@prisma/client';



interface ShippingRate {
    service_name: string;
    service_code: string;
    total_price: string;
    description: string;
    currency: string;
}

interface AusPostApiResponse {
    services: {
        service: {
            code: string;
            name: string;
            price: number;
            delivery_time: string;
        }[];
    };
}

interface ShopCarrierConfig {
    id: number;
    shopId: number;
    carrierId: number;
    isActive: boolean;
    apiKey: string | null;
    memberNumber: string | null;
    useDescription: boolean;
    carrier: {
        id: number;
        name: string;
        defaultApiKey: string;
    };
}

export const action: ActionFunction = async ({ request }) => {
    console.log("Australia Post lookup action called - Initial log");
    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const body = await request.json();
        console.log("Received Australia Post lookup request:", JSON.stringify(body, null, 2));

        const shopUrl = request.headers.get('X-Shopify-Shop-Domain');
        console.log("Shop URL:", shopUrl);

        if (!shopUrl) {
            throw new Error('Shop URL not provided in headers');
        }

        const shopCarrier = await prisma.carrierConfig.findFirst({
            where: {
                shop: {
                    shopifyUrl: `https://${shopUrl}`,
                },
                isActive: true,
                carrier: {
                    name: "Australia Post"
                }
            },
            include: {
                carrier: true
            }
        }) as (CarrierConfig & { carrier: { defaultApiKey: string } }) | null;

        if (!shopCarrier) {
            console.log("Australia Post carrier not configured for this shop");
            return json({ success: false, error: "Australia Post carrier not configured" }, { status: 400 });
        }

        const useDescription = shopCarrier.useDescription;
        const apiKey = shopCarrier.apiKey || shopCarrier.carrier.defaultApiKey;

        console.log("Shop carrier config:", JSON.stringify(shopCarrier, null, 2));

        const fromPostcode = '2000'; // Default from postcode
        const toPostcode = body.rate.destination.postal_code;
        const weight = body.rate.items.reduce((total: number, item: { grams: number; quantity: number }) => total + (item.grams * item.quantity), 0) / 1000; // Convert to kg

        console.log("From Postcode:", fromPostcode);
        console.log("To Postcode:", toPostcode);
        console.log("Weight (kg):", weight);

        if (!toPostcode) {
            console.error("Destination postal code is missing");
            return json({ success: false, error: "Destination postal code is required" }, { status: 400 });
        }

        const ausPostApiUrl = `https://digitalapi.auspost.com.au/postage/parcel/domestic/service.json?from_postcode=${fromPostcode}&to_postcode=${toPostcode}&length=22&width=16&height=7.7&weight=${weight}`;
        console.log("Australia Post API URL:", ausPostApiUrl);

        const ausPostResponse = await fetch(ausPostApiUrl, {
            headers: {
                'AUTH-KEY': apiKey,
            },
        });

        console.log("Australia Post API response status:", ausPostResponse.status);

        if (!ausPostResponse.ok) {
            const errorText = await ausPostResponse.text();
            console.error("Australia Post API error response:", errorText);
            throw new Error(`Australia Post API error: ${ausPostResponse.statusText}. Response: ${errorText}`);
        }

        const ausPostData: AusPostApiResponse = await ausPostResponse.json();
        console.log("Australia Post API response data:", JSON.stringify(ausPostData, null, 2));

        const australiaPostRates: ShippingRate[] = ausPostData.services.service.map(service => ({
            service_name: service.name,
            service_code: service.code,
            total_price: (service.price * 100).toString(), // Convert to cents
            description: useDescription ? `Estimated ${service.delivery_time}` : '',
            currency: 'AUD',
        }));

        console.log("Returning Australia Post rates:", australiaPostRates);
        return json({ success: true, rates: australiaPostRates });
    } catch (error: unknown) {
        console.error("Error processing Australia Post lookup:", error);
        return json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
};

export const loader = () => {
    return json({ message: 'Australia Post Lookup API is up.' });
};
