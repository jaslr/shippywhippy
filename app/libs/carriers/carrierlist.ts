import axios from 'axios';

export type CarrierStatus = {
    id: string;
    name: string;
    isUp: boolean;
    statusURL?: string;
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
    { id: '1', name: 'Australia Post', isUp: true, statusURL: 'https://status.developers.auspost.com.au/' },
    { id: '2', name: 'Aramex', isUp: true, statusURL: 'https://www.aramex.com/us/en/service-updates' },
];

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

