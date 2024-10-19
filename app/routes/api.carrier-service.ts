import shopify from '~/shopify.server';
import { json, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { updateCarrierStatuses, carrierList, CarrierStatus } from '~/libs/carriers/carrierlist';
import { getApiKey } from '~/libs/carriers/utils/getApiKey';
import { authenticate } from "~/shopify.server";
import { prisma } from '~/prisma';

interface CarrierServiceRequest {
    rate: {
        origin: {
            country: string;
            postal_code: string;
            province: string;
            city: string;
            name: string | null;
            address1: string;
            address2: string;
            address3: string | null;
            phone: string | null;
            fax: string | null;
            email: string | null;
            address_type: string | null;
            company_name: string | null;
        };
        destination: {
            country: string;
            postal_code: string;
            province: string;
            city: string;
            name: string | null;
            address1: string;
            address2: string;
            address3: string | null;
            phone: string | null;
            fax: string | null;
            email: string | null;
            address_type: string | null;
            company_name: string | null;
        };
        items: Array<{
            name: string;
            sku: string;
            quantity: number;
            grams: number;
            price: number;
            vendor: string;
            requires_shipping: boolean;
            taxable: boolean;
            fulfillment_service: string;
            properties: null | Record<string, unknown>;
            product_id: number;
            variant_id: number;
        }>;
        currency: string;
        locale: string;
    };
}

interface ShippingRate {
    service_name: string;
    service_code: string;
    total_price: string;
    description: string;
    currency: string;
    min_delivery_date?: string;
    max_delivery_date?: string;
}

export const action: ActionFunction = async ({ request }) => {
    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        // Remove the session authentication
        // const { session } = await authenticate.admin(request);
        const body: CarrierServiceRequest = await request.json();
        console.log("Received rate request:", body);

        // Use a different method to get the shop URL
        const shopUrl = request.headers.get('X-Shopify-Shop-Domain');

        if (!shopUrl) {
            throw new Error('Shop URL not provided in headers');
        }

        const shopCarriers = await prisma.carrierConfig.findMany({
            where: {
                shop: {
                    shopifyUrl: shopUrl,
                },
                isActive: true,
            },
            include: {
                carrier: true,
            },
        });

        let rates: ShippingRate[] = [];

        for (const shopCarrier of shopCarriers) {
            if (shopCarrier.carrier.name === "Australia Post") {
                try {
                    const australiaPostResponse = await fetch(`${process.env.APP_URL}/api/australia-post-lookup`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': request.headers.get('Authorization') || '',
                        },
                        body: JSON.stringify(body)
                    });

                    if (!australiaPostResponse.ok) {
                        console.error(`Australia Post API error: ${australiaPostResponse.statusText}`);
                        continue;
                    }

                    const australiaPostRates = await australiaPostResponse.json();
                    console.log("Australia Post rates:", australiaPostRates);
                    if (australiaPostRates.success && Array.isArray(australiaPostRates.rates)) {
                        rates = rates.concat(australiaPostRates.rates);
                    } else {
                        console.error('Invalid response from Australia Post API');
                    }
                } catch (error) {
                    console.error("Error fetching Australia Post rates:", error);
                }
            }
        }

        // Add local rates
        rates = rates.concat(getLocalRates());

        console.log("Final rates:", rates);
        return json({ rates });
    } catch (error) {
        console.error("Error processing rate request:", error);
        return json({ rates: getLocalRates() });
    }
};

function getLocalRates(): ShippingRate[] {
    return [
        {
            service_name: "Standards Shipping",
            service_code: "ST",
            total_price: "1000",
            description: "Estimated 3-7 business days",
            currency: "AUD",
        },
        {
            service_name: "Express Shipping",
            service_code: "EX",
            total_price: "1500",
            description: "Estimated 1-3 business days",
            currency: "AUD",
        }
    ];
}

export const loader: LoaderFunction = async () => {
    return json({ message: 'Carrier Service API is up.' });
};
