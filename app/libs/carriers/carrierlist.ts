import axios from 'axios';

export type CarrierStatus = {
    id: string;
    shop: string;
    isActive: boolean;
    name: string;
    isUp: boolean;
    statusURL?: string;
    apiKeyEnvVar: string;
    defaultApiKey: string;
};

async function checkAustraliaPostStatus(): Promise<boolean> {
    try {
        const formData = new FormData();
        formData.append('apiKey', 'YOUR_API_KEY_HERE');
        formData.append('checkType', 'uptime');

        const response = await axios.post('/api/australia-post-lookup', formData);
        return response.data.success;
    } catch (error) {
        return false;
    }
}

async function checkAramexStatus(): Promise<boolean> {
    // Stub response: always return false (down) for now
    return false;
}

export const carrierList: CarrierStatus[] = [
    { 
        id: '1', 
        shop: 'shop1', 
        isActive: true, 
        name: 'Australia Post', 
        isUp: true, 
        statusURL: 'https://status.developers.auspost.com.au/', 
        apiKeyEnvVar: 'AUSTRALIA_POST_API_KEY',
        defaultApiKey: 'your-default-australia-post-api-key'
    },
    { 
        id: '2', 
        shop: 'shop2', 
        isActive: true, 
        name: 'Aramex', 
        isUp: true, 
        statusURL: 'https://www.aramex.com/us/en/service-updates', 
        apiKeyEnvVar: 'ARAMEX_API_KEY',
        defaultApiKey: 'your-default-aramex-api-key'
    },
];

export function getCarrierById(id: string): CarrierStatus | undefined {
    return carrierList.find(carrier => carrier.id === id);
}

export function getCarrierByName(name: string): CarrierStatus | undefined {
    return carrierList.find(carrier => carrier.name.toLowerCase() === name.toLowerCase());
}

export async function updateCarrierStatuses(): Promise<CarrierStatus[]> {
    const updatedList = await Promise.all(carrierList.map(async (carrier) => {
        let isUp = false;
        switch (carrier.id) {
            case '1':
                isUp = await checkAustraliaPostStatus();
                break;
            case '2':
                isUp = await checkAramexStatus();
                break;
            default:
                isUp = false;
        }
        return { ...carrier, isUp };
    }));

    return updatedList;
}
