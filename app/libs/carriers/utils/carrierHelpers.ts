import { Carrier } from '../types/carrier';

export function validateApiKey(apiKey: string): boolean {
    // Implement your API key validation logic here
    return apiKey.length > 0;
}

export function formatCarrierName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export function getActiveCarriers(carriers: Carrier[]): Carrier[] {
    return carriers.filter(carrier => carrier.isActive);
}