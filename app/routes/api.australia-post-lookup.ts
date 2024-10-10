import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const API_KEY = formData.get("apiKey") as string;
    const checkType = formData.get("checkType") as string;

    if (!API_KEY) {
        return json({ success: false, error: "API key is missing" }, { status: 400 });
    }

    if (checkType === "uptime") {
        return await performUptimeCheck(API_KEY);
    } else {
        return await performShippingCalculation(API_KEY);
    }
};

async function performUptimeCheck(API_KEY: string) {
    try {
        const response = await fetch(
            'https://digitalapi.auspost.com.au/postage/parcel/domestic/service.json?from_postcode=2000&to_postcode=3000&length=10&width=10&height=10&weight=1',
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

async function performShippingCalculation(API_KEY: string) {
    // Existing shipping calculation logic
    // ... (keep the existing code here)
}