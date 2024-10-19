import shopify from '~/shopify.server';
import { json, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { updateCarrierStatuses, carrierList, CarrierStatus } from '~/libs/carriers/carrierlist';
import { getApiKey } from '~/libs/carriers/utils/getApiKey';
import { authenticate } from "~/shopify.server";

interface CarrierServiceRequest {
    rate: {
        origin: {
            country: string;
            postal_code: string;
            province: string;
            city: string;
            name: string;
            address1: string;
            address2: string;
            address3: string;
            phone: string;
            fax: string;
            email: string;
            address_type: string;
            company_name: string;
        };
        destination: {
            country: string;
            postal_code: string;
            province: string;
            city: string;
            name: string;
            address1: string;
            address2: string;
            address3: string;
            phone: string;
            fax: string;
            email: string;
            address_type: string;
            company_name: string;
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
            properties: null;
            product_id: number;
            variant_id: number;
        }>;
        currency: string;
        locale: string;
    };
}

export const action: ActionFunction = async ({ request }) => {
    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        const { session } = await authenticate.admin(request);
        const body: CarrierServiceRequest = await request.json();
        console.log("Received rate request:", body);

        const shop = session.shop;
        const carriers = carrierList.filter((carrier: CarrierStatus) => carrier.shop === shop);

        let rates = [];

        const australiaPostCarrier = carriers.find((carrier: CarrierStatus) => carrier.name === "Australia Post");

        if (australiaPostCarrier && australiaPostCarrier.isActive) {
            const apiKey = await getApiKey(shop, "Australia Post");
            if (apiKey) {
                try {
                    const response = await fetch('http://localhost:3000/api/australia-post-lookup', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            apiKey,
                            checkType: 'shipping',
                            origin: body.rate.origin,
                            destination: body.rate.destination,
                            items: body.rate.items
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const australiaPostRates = await response.json();
                    if (australiaPostRates.success && australiaPostRates.data) {
                        rates = australiaPostRates.data.rates;
                    }
                } catch (error) {
                    console.error("Error fetching Australia Post rates:", error);
                    // Fall back to local rates
                    rates = getLocalRates();
                }
            } else {
                console.error("API key not found for Australia Post");
                rates = getLocalRates();
            }
        } else {
            console.log("Australia Post carrier not found or not active");
            rates = getLocalRates();
        }

        const response = {
            rates
        };

        console.log("Sending rate response:", response);
        return json(response);
    } catch (error) {
        console.error("Error processing rate request:", error);
        return json({ rates: getLocalRates() });
    }
};

function getLocalRates() {
    return [
        {
            service_name: "Standard Shipping",
            service_code: "ST",
            total_price: "1000", // in cents
            description: "Estimated 3-7 business days",
            currency: "AUD",
        },
        {
            service_name: "Express Shipping",
            service_code: "EX",
            total_price: "1500", // in cents
            description: "Estimated 1-3 business days",
            currency: "AUD",
        }
    ];
}

export const loader: LoaderFunction = async () => {
    return json({ message: 'Carrier Service API is up.' });
};
