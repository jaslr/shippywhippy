import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import axios from 'axios';

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const apiKey = formData.get('apiKey') as string;

    if (!apiKey) {
        return json({ success: false, error: 'API Key is required' }, { status: 400 });
    }

    try {
        const response = await axios.get('https://digitalapi.auspost.com.au/postage/parcel/domestic/type.json', {
            headers: { 'AUTH-KEY': apiKey }
        });

        return json({ success: true, data: response.data });
    } catch (error) {
        console.error('Error testing Australia Post API:', error);
        return json({ success: false, error: 'Failed to test Australia Post API' }, { status: 500 });
    }
};
