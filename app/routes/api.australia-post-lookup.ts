import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
    const { apiKey, checkType, origin, destination, items } = await request.json();

    if (!apiKey) {
        return json({ success: false, error: "API key is missing" }, { status: 400 });
    }

    if (checkType === "shipping") {
        return await performShippingCalculation(apiKey, origin, destination, items);
    } else if (checkType === "uptime") {
        return await performUptimeCheck(apiKey);
    } else {
        return json({ success: false, error: "Invalid check type" }, { status: 400 });
    }
};

async function performUptimeCheck(API_KEY: string) {
    try {
        const response = await fetch(
            'https://digitalapi.auspost.com.au/',
            {
                headers: {
                    'AUTH-KEY': API_KEY
                }
            }
        );

        return json({ success: response.ok });
    } catch (error) {
        return json({ success: false });
    }
}

async function performShippingCalculation(API_KEY: string, origin: any, destination: any, items: Array<any>) {
    try {
        const totalWeight = items.reduce((sum, item) => sum + item.grams * item.quantity, 0) / 1000; // in kg
        const totalLength = items.reduce((sum, item) => sum + item.name.length * item.quantity, 0); // simplistic

        const response = await fetch(
            `https://digitalapi.auspost.com.au/postage/parcel/domestic/calculate.json?from_postcode=${origin.postal_code}&to_postcode=${destination.postal_code}&length=${totalLength}&width=10&height=10&weight=${totalWeight}`,
            {
                headers: {
                    'AUTH-KEY': API_KEY
                }
            }
        );

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();

        const rates = data.services.map((service: any) => ({
            service_name: service.service_name,
            service_code: service.service_code,
            total_price: (service.base_price * 100).toString(),
            description: service.description,
            currency: "AUD",
        }));

        return json({ success: true, data: { rates } });
    } catch (error) {
        console.error("Error fetching Australia Post rates:", error);
        // Fallback to local shipping rates
        const localRates = [
            {
                service_name: "Local Standard Shipping",
                service_code: "LST",
                total_price: "1000", // in cents
                description: "Estimated 3-7 business days",
                currency: "AUD",
            },
            {
                service_name: "Local Express Shipping",
                service_code: "LEX",
                total_price: "1500", // in cents
                description: "Estimated 1-3 business days",
                currency: "AUD",
            }
        ];
        return json({ success: true, data: { rates: localRates } });
    }
}
