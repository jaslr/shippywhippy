import shopify from '~/shopify.server';
import { json, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { updateCarrierStatuses, carrierList, CarrierStatus } from '~/libs/carriers/carrierlist';
import { getApiKey } from '~/libs/carriers/utils/getApiKey';
import { authenticate } from "~/shopify.server";
import { prisma } from '~/prisma';
import shopifyApp from '~/shopify.server';
import { GraphqlClient } from '@shopify/shopify-api';

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

const EXCLUDE_LOCAL_RATES = true; // New constant to control local rates

export const action: ActionFunction = async ({ request }) => {
    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const body: CarrierServiceRequest = await request.json();
        console.log("Received rate request:", body);

        const shopUrl = request.headers.get('X-Shopify-Shop-Domain');

        if (!shopUrl) {
            throw new Error('Shop URL not provided in headers');
        }

        console.log("Shop URL:", shopUrl);

        const shop = await prisma.shop.findFirst({
            where: {
                shopifyUrl: `https://${shopUrl}`,
            },
        }) as (Shop & { postalCode?: string | null });

        console.log("Shop details:", JSON.stringify(shop, null, 2));

        if (!shop) {
            console.error("Shop not found");
            return json({ rates: getLocalRates() });
        }

        // Fetch shop location from Shopify
        const shopLocation = await getShopLocation(shop);
        console.log("Shop location:", JSON.stringify(shopLocation, null, 2));

        const activeCarriers = await prisma.carrierConfig.findMany({
            where: {
                isActive: true,
                shopId: shop.id
            },
            include: {
                carrier: true,
                shop: true,
            },
        });
        console.log("Active carriers:", JSON.stringify(activeCarriers, null, 2));

        let rates: ShippingRate[] = [];

        for (const shopCarrier of activeCarriers) {
            if (shopCarrier.carrier.name === "Australia Post") {
                console.log("Attempting to call Australia Post API");
                try {
                    const australiaPostResponse = await fetch(`${process.env.APP_URL}/api/australia-post-lookup`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Shopify-Shop-Domain': shopUrl,
                        },
                        body: JSON.stringify({
                            ...body,
                            shopLocation: shopLocation,
                            shopPostalCode: shop?.postalCode, // Use optional chaining here
                            length: 22,
                            width: 16,
                            height: 7.7
                        })
                    });

                    console.log("Australia Post API response status:", australiaPostResponse.status);

                    if (!australiaPostResponse.ok) {
                        console.error(`Australia Post API error: ${australiaPostResponse.statusText}`);
                        const errorText = await australiaPostResponse.text();
                        console.error("Error details:", errorText);
                        continue;
                    }

                    const australiaPostRates = await australiaPostResponse.json();
                    console.log("Australia Post rates:", JSON.stringify(australiaPostRates, null, 2));

                    if (australiaPostRates.success && Array.isArray(australiaPostRates.rates)) {
                        rates = rates.concat(australiaPostRates.rates);
                    } else {
                        console.error('Invalid response from Australia Post API:', australiaPostRates);
                    }
                } catch (error) {
                    console.error("Error fetching Australia Post rates:", error);
                }
            }
        }

        // Add local rates only if EXCLUDE_LOCAL_RATES is false
        if (!EXCLUDE_LOCAL_RATES) {
            rates = rates.concat(getLocalRates());
        }

        console.log("Final rates:", rates);
        return json({ rates });
    } catch (error) {
        console.error("Error processing rate request:", error);
        // Return local rates only if EXCLUDE_LOCAL_RATES is false
        return json({ rates: EXCLUDE_LOCAL_RATES ? [] : getLocalRates() });
    }
};

async function getShopLocation(shop: any) {
    console.log("Attempting to get shop location for:", shop.shopifyUrl);

    try {
        const sessions = await shopifyApp.sessionStorage.findSessionsByShop(shop.shopifyUrl);
        console.log("Found sessions:", sessions);

        if (!sessions || sessions.length === 0) {
            console.log("No session found for shop:", shop.shopifyUrl);
            return null; // Return null instead of throwing an error
        }

        const client = new GraphqlClient({
            session: sessions[0]
        });

        const query = `
        query {
          locations(first: 1, sortKey: CREATED_AT) {
            edges {
              node {
                id
                name
                address {
                  address1
                  address2
                  city
                  provinceCode
                  zip
                  countryCode
                }
                isActive
                fulfillsOnlineOrders
              }
            }
          }
        }
        `;

        const response = await client.query({ data: query });
        console.log("Shopify API response:", JSON.stringify(response, null, 2));

        if (!response.body) {
            console.log('No response body received from Shopify GraphQL API');
            return null;
        }

        const responseBody = response.body as any;

        if (!responseBody.data || !responseBody.data.locations || !responseBody.data.locations.edges || responseBody.data.locations.edges.length === 0) {
            console.log('Invalid or empty response from Shopify GraphQL API');
            return null;
        }

        const location = responseBody.data.locations.edges[0]?.node;

        if (!location || !location.address) {
            console.log('No valid location data found in Shopify response');
            return null;
        }

        return {
            address1: location.address.address1 || '',
            address2: location.address.address2 || '',
            city: location.address.city || '',
            provinceCode: location.address.provinceCode || '',
            zip: location.address.zip || '',
            countryCode: location.address.countryCode || '',
        };
    } catch (error) {
        console.error("Error in getShopLocation:", error);
        return null;
    }
}

function getLocalRates(): ShippingRate[] {
    return [
        {
            service_name: "Standard Shipping",
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
