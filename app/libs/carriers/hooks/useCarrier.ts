import { useState } from 'react';
import { Carrier } from '../types/carrier';

export function useCarrier(initialCarrier: Carrier) {
    const [carrier, setCarrier] = useState<Carrier>(initialCarrier);

    const toggleActive = () => {
        setCarrier(prev => ({ ...prev, isActive: !prev.isActive }));
    };

    const updateApiKey = (newApiKey: string) => {
        setCarrier(prev => ({ ...prev, apiKey: newApiKey }));
    };

    return {
        carrier,
        toggleActive,
        updateApiKey,
    };
}