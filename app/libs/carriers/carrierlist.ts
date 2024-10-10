import axios from 'axios';

export type CarrierStatus = {
    id: string;
    name: string;
    isUp: boolean;
    statusURL?: string;
};

async function checkCarrierStatus(url: string): Promise<boolean> {
    try {
        const response = await axios.get(url);
        return response.status >= 200 && response.status < 300;
    } catch (error) {
        return false;
    }
}

async function checkAustraliaPostStatus(): Promise<boolean> {
    return await checkCarrierStatus('https://auspost.com.au/api/health-check');
}

async function checkAramexStatus(): Promise<boolean> {
    return await checkCarrierStatus('https://www.aramex.com/api/health');
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

