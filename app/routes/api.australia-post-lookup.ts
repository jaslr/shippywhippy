import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const API_KEY = formData.get("apiKey") as string;

    if (!API_KEY) {
        return json({ success: false, error: "API key is missing" }, { status: 400 });
    }

    const fromPostcode = '3000'; // Melbourne
    const toPostcode = '2000'; // Sydney
    const length = '10';
    const width = '10';
    const height = '10';
    const weight = '1';
    const serviceCode = 'AUS_PARCEL_REGULAR'; // Add this line

    try {
        const response = await fetch(
            `https://digitalapi.auspost.com.au/postage/parcel/domestic/calculate.json?from_postcode=${fromPostcode}&to_postcode=${toPostcode}&length=${length}&width=${width}&height=${height}&weight=${weight}&service_code=${serviceCode}`,
            {
                headers: {
                    'AUTH-KEY': API_KEY
                }
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch data from Australia Post API: ${response.status} ${response.statusText}. ${errorText}`);
        }

        const data = await response.json();
        return json({ success: true, data });
    } catch (error: unknown) {
        console.error("Australia Post API error:", error);
        if (error instanceof Error) {
            return json({ success: false, error: error.message }, { status: 400 });
        } else {
            return json({ success: false, error: 'An unknown error occurred' }, { status: 400 });
        }
    }
};