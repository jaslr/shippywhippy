import { json, type ActionFunction } from '@remix-run/node';
import { authenticate } from '../shopify.server';

export const action: ActionFunction = async ({ request }) => {
    if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
        await authenticate.admin(request);
        const { apiKey, countryCode, weight } = await request.json();

        const url = `https://digitalapi.auspost.com.au/postage/parcel/international/service.json?country_code=${countryCode}&weight=${weight}`;

        console.log('Fetching international services with URL:', url);

        const response = await fetch(url, {
            headers: {
                'AUTH-KEY': apiKey,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Australia Post API error:', response.status, errorText);
            throw new Error(`Australia Post API error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Successfully fetched international services:', data);

        // Ensure the response is correctly formatted and returned
        const formattedData = {
            services: {
                service: data.services.service.map((service: any) => ({
                    code: service.code,
                    name: service.name,
                    price: service.price,
                    max_extra_cover: service.max_extra_cover,
                    options: service.options,
                })),
            },
        };

        return json(formattedData);
    } catch (error: unknown) {
        console.error("Error fetching international services:", error);
        return json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
};

export const loader = () => {
    return json({ message: 'Australia Post International API is up.' });
};
