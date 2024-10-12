import shopify from '~/shopify.server';
import { json, type LoaderFunction, type ActionFunction } from '@remix-run/node';
import { updateCarrierStatuses, carrierList } from '~/libs/carriers/carrierlist';
import { CarrierStatus } from '~/libs/carriers/carrierlist';

// Define the expected structure of Shopify's CarrierService request
interface CarrierServiceRequest {
    carrierService: {
        id: number;
        name: string;
        callback_url: string;
        service_discovery: boolean;
    };
    rate: {
        name: string;
        price: string;
        currency: string;
        min_delivery_date: string;
        max_delivery_date: string;
    };
    shippingAddress: {
        country: string;
        province: string;
        city: string;
        zip: string;
        address1: string;
        address2: string;
    };
}

// Define the structure for shipping rates
interface ShippingRate {
    name: string;
    price: string;
    service_code?: string;
    carrier_identifier?: string;
    currency: string;
}

// Action function to handle Carrier Service requests
export const action: ActionFunction = async ({ request }) => {
    try {
        const payload: CarrierServiceRequest = await request.json();

        // Log incoming request for debugging
        console.log('Received Carrier Service request:', payload);

        // Update carrier statuses if necessary
        const updatedCarriers: CarrierStatus[] = await updateCarrierStatuses();

        // Find the carrier based on the CarrierService ID or name
        const carrier = updatedCarriers.find(
            (c) => c.name === payload.carrierService.name
        );

        if (!carrier || !carrier.isUp) {
            return json(
                {
                    rates: [],
                },
                { status: 200 }
            );
        }

        // Log additional information for debugging
        console.log('Processing Carrier Service request for shop:', payload.carrierService.name);
        console.log('Shipping Address:', payload.shippingAddress);

        // Define your shipping rates here
        const rates: ShippingRate[] = [
            {
                name: 'Shippy Wippy Standard Shipping',
                price: '10.00',
                currency: payload.rate.currency,
            },
            {
                name: 'Shippy Wippy Express Shipping',
                price: '20.00',
                currency: payload.rate.currency,
            },
        ];

        // Respond with the available shipping rates
        return json(
            {
                rates,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error processing Carrier Service request:', error);
        return json(
            {
                errors: 'Failed to process shipping rates.',
            },
            { status: 500 }
        );
    }
};

// Optional: Loader function for GET requests (if needed)
export const loader: LoaderFunction = async () => {
    return json({ message: 'Carrier Service API is up.' });
};
