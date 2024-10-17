import { json } from '@remix-run/node';
import { getApiKey } from '../../libs/carriers/utils/getApiKey';

export async function action({ request }: { request: Request }) {
    const formData = await request.formData();
    const shop = formData.get('shop') as string;
    const carrierName = formData.get('carrierName') as string;

    try {
        const apiKey = await getApiKey(shop, carrierName);
        return json({ apiKey });
    } catch (error) {
        console.error('Error fetching API key:', error);
        return json({ error: 'Failed to fetch API key' }, { status: 500 });
    }
}
