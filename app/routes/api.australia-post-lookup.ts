import { json, type ActionFunction } from '@remix-run/node';
import { authenticate } from "~/shopify.server";
import { prisma } from '~/prisma';

interface ShippingRate {
    service_name: string;
    service_code: string;
    total_price: string;
    description: string;
    currency: string;
}

export const action: ActionFunction = async ({ request }) => {
    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const { session } = await authenticate.admin(request);
        const body = await request.json();
        console.log("Received Australia Post lookup request:", body);

        const shopCarrier = await prisma.carrierConfig.findFirst({
            where: {
                shop: {
                    shopifyUrl: session.shop,
                },
                isActive: true,
                carrier: {
                    name: "Australia Post"
                }
            },
            include: {
                carrier: true,
            },
        });

        if (!shopCarrier) {
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
