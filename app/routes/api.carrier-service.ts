import shopify from '~/shopify.server';
import { json, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { updateCarrierStatuses, carrierList } from '~/libs/carriers/carrierlist';
import { CarrierStatus } from '~/libs/carriers/carrierlist';

// Define the expected structure of Shopify's CarrierService request
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
        const body = await request.json();
        console.log("Received rate request:", body);
        // Simple rate calculation based on the number of items
        const itemCount = body.rate.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
        const baseRate = 10; // Base rate in dollars
        const ratePerItem = 2; // Additional rate per item in dollars

        const totalRate = baseRate + (itemCount * ratePerItem);

        const response = {
            rates: [
                {
                    service_name: "Whippy Standard Shipping",
                    service_code: "ST",
                    total_price: (totalRate * 100).toString(), // Convert to cents
                    description: "Estimated 3-7 business days",
                    currency: "USD",
                },
                {
                    service_name: "Express Shipping",
                    service_code: "EX",
                    total_price: ((totalRate * 1.5) * 100).toString(), // 50% more than standard, convert to cents
                    description: "Estimated 1-3 business days",
                    currency: "USD",
                }
            ]
        };

        console.log("Sending rate response:", response);
        return json(response);
    } catch (error) {
        console.error("Error processing rate request:", error);
        return json({ error: "Internal server error" }, { status: 500 });
    }
};

// Optional: Loader function for GET requests (if needed)
export const loader: LoaderFunction = async () => {
    return json({ message: 'Carrier Service API is up.' });
};
