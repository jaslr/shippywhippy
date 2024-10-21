import { json, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { prisma } from '~/prisma';

interface ParcelType {
    code: string;
    name: string;
}

export const action: ActionFunction = async ({ request }) => {
    if (request.method !== 'POST') {
        return json({ error: 'Method not allowed' }, { status: 405 });
    }

    try {
        const { apiKey } = await request.json();

        const ausPostApiUrl = 'https://digitalapi.auspost.com.au/postage/parcel/domestic/type.json';
        const ausPostResponse = await fetch(ausPostApiUrl, {
            headers: {
                'AUTH-KEY': apiKey,
            },
        });

        if (!ausPostResponse.ok) {
            throw new Error(`Australia Post API error: ${ausPostResponse.statusText}`);
        }

        const ausPostData = await ausPostResponse.json();
        const parcelTypes: ParcelType[] = ausPostData.types.type.map((type: any) => ({
            code: type.code,
            name: type.name,
        }));

        return json({ parcelTypes });
    } catch (error) {
        console.error('Error fetching Australia Post parcel types:', error);
        return json({ error: 'Failed to fetch parcel types' }, { status: 500 });
    }
};

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const apiKey = url.searchParams.get('apiKey');

    if (!apiKey) {
        return json({ error: 'API key is required' }, { status: 400 });
    }

    try {
        const ausPostApiUrl = 'https://digitalapi.auspost.com.au/postage/parcel/domestic/type.json';
        const ausPostResponse = await fetch(ausPostApiUrl, {
            headers: {
                'AUTH-KEY': apiKey,
            },
        });

        if (!ausPostResponse.ok) {
            throw new Error(`Australia Post API error: ${ausPostResponse.statusText}`);
        }

        const ausPostData = await ausPostResponse.json();
        const parcelTypes: ParcelType[] = ausPostData.types.type.map((type: any) => ({
            code: type.code,
            name: type.name,
        }));

        return json({ parcelTypes });
    } catch (error) {
        console.error('Error fetching Australia Post parcel types:', error);
        return json({ error: 'Failed to fetch parcel types' }, { status: 500 });
    }
};
