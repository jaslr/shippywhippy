import { json, type ActionFunction } from '@remix-run/node';
import { prisma } from '~/prisma';
import { authenticate } from '../shopify.server';
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

const EXCLUDE_SMALL_SERVICE = process.env.EXCLUDE_SMALL_SERVICE !== 'false';
const EXCLUDE_HARDCODED_RATES = true; // New constant to control hardcoded rates

const RATE_LIMIT_DELAY = 2000; // 2 seconds

export const action: ActionFunction = async ({ request }) => {
    console.log("Australia Post lookup action called - Initial log");
    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const { admin } = await authenticate.admin(request);
        const body = await request.json();
        console.log("Received Australia Post lookup request:", JSON.stringify(body, null, 2));

        const shopUrl = request.headers.get('X-Shopify-Shop-Domain');
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
                    name: 'Australia Post',
                },
            },
            include: {
                carrier: true,
                shop: true,
            },
        });

        if (!shopCarrier) {
            throw new Error('Australia Post carrier configuration not found');
        }

        // Fetch locations
        const locationsResponse = await admin.graphql(
            `query {
                locations(first: 50) {
                    edges {
                        node {
                            id
                            name
                            address {
                                zip
                            }
                        }
                    }
                }
            }`
        );

        const {
            data: {
                locations: { edges },
            },
        } = await locationsResponse.json();

        const locations = edges.map(({ node }: any) => ({
            id: node.id,
            name: node.name,
            postalCode: node.address.zip,
        }));

        const toPostcode = body.rate.destination.postal_code;
        const weight = body.rate.items.reduce((total: number, item: any) => total + (item.grams / 1000), 0);
        const length = body.length || 22;
        const width = body.width || 16;
        const height = body.height || 7.7;

        const allRates: ShippingRate[] = [];

        // Domestic rates
        for (const location of locations) {
            const apiUrl = `https://digitalapi.auspost.com.au/postage/parcel/domestic/service.json?from_postcode=${location.postalCode}&to_postcode=${toPostcode}&length=${length}&width=${width}&height=${height}&weight=${weight}`;
            const ausPostResponse = await fetchAusPostApi(apiUrl, shopCarrier.apiKey || shopCarrier.carrier.defaultApiKey);
            const ausPostData: AusPostApiResponse = await ausPostResponse.json();

            let australiaPostRates: ShippingRate[] = ausPostData.services.service.map(service => ({
                service_name: `${location.name} - ${service.name}`,
                service_code: `${location.id}_${service.code}`,
                total_price: (service.price * 100).toString(),
                description: shopCarrier.useDescription ? `Estimated ${service.delivery_time}` : '',
                currency: 'AUD',
            }));

            if (EXCLUDE_SMALL_SERVICE) {
                australiaPostRates = australiaPostRates.filter(rate => !rate.service_name.toLowerCase().includes('small'));
            }

            allRates.push(...australiaPostRates);
            await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
        }

        // International rates
        const countryCode = body.rate.destination.country;
        if (countryCode && countryCode !== 'AU') {
            const intApiUrl = `https://digitalapi.auspost.com.au/postage/parcel/international/service.json?country_code=${countryCode}&weight=${weight}`;
            const intAusPostResponse = await fetchAusPostApi(intApiUrl, shopCarrier.apiKey || shopCarrier.carrier.defaultApiKey);
            const intAusPostData = await intAusPostResponse.json();

            const internationalRates: ShippingRate[] = intAusPostData.services.service.map((service: any) => ({
                service_name: `International - ${service.name}`,
                service_code: `INT_${service.code}`,
                total_price: (service.price * 100).toString(),
                description: shopCarrier.useDescription ? service.delivery_time : '',
                currency: 'AUD',
            }));

            allRates.push(...internationalRates);
        }

        console.log("Returning Australia Post rates:", allRates);
        return json({ success: true, rates: allRates });
    } catch (error: unknown) {
        console.error("Error processing Australia Post lookup:", error);
        return json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
};

async function fetchAusPostApi(url: string, apiKey: string) {
    const response = await fetch(url, {
        headers: {
            'AUTH-KEY': apiKey,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Australia Post API error response:", errorText);
        throw new Error(`Australia Post API error: ${response.statusText}. Response: ${errorText}`);
    }

    return response;
}

// Helper function to identify hardcoded rates
function isHardcodedRate(serviceCode: string): boolean {
    // Add the service codes of your hardcoded rates here
    const hardcodedServiceCodes = ['HARDCODED_RATE_1', 'HARDCODED_RATE_2'];
    return hardcodedServiceCodes.includes(serviceCode);
}

export const loader = () => {
    return json({ message: 'Australia Post Lookup API is up.' });
};
