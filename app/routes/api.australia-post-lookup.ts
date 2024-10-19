import { json, type ActionFunction } from '@remix-run/node';
import { prisma } from '~/prisma';

interface ShippingRate {
    service_name: string;
    service_code: string;
    total_price: string;
    description: string;
    currency: string;
}

export const action: ActionFunction = async ({ request }) => {
    console.log("Australia Post lookup action called");
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
                    shopifyUrl: shopUrl,
                },
                isActive: true,
                carrier: {
                    name: "Australia Post"
                }
            },
            include: {
                carrier: true,
                shop: true,
            },
        });

        console.log("Shop carrier config:", JSON.stringify(shopCarrier, null, 2));

        if (!shopCarrier) {
            console.log("Australia Post carrier not configured for this shop");
            return json({ success: false, error: "Australia Post carrier not configured" }, { status: 400 });
        }

        // Hardcoded rates for Australia Post
        const australiaPostRates: ShippingRate[] = [
            {
                service_name: "Australia Post Standard",
                service_code: "APS",
                total_price: "1200",
                description: "Estimated 3-7 business days",
                currency: "AUD",
            },
            {
                service_name: "Australia Post Express",
                service_code: "APE",
                total_price: "2000",
                description: "Estimated 1-3 business days",
                currency: "AUD",
            }
        ];

        console.log("Returning Australia Post rates:", australiaPostRates);
        return json({ success: true, rates: australiaPostRates });
    } catch (error) {
        console.error("Error processing Australia Post lookup:", error);
        return json({ success: false, error: "Internal server error" }, { status: 500 });
    }
};

export const loader = () => {
    return json({ message: 'Australia Post Lookup API is up.' });
};
