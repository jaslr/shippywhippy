import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action: ActionFunction = async ({ request }) => {
    const { admin } = await authenticate.admin(request);

    // Parse the incoming request
    const body = await request.json();

    // Basic rate calculation (you'll want to expand this)
    const rates = [
        {
            service_name: "Standard Shipping",
            service_code: "ST",
            total_price: "1000", // $10.00
            currency: "AUD",
            min_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            max_delivery_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            service_name: "Express Shipping",
            service_code: "EX",
            total_price: "2000", // $20.00
            currency: "AUD",
            min_delivery_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            max_delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ];

    return json({ rates });
};