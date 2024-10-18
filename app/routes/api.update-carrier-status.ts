import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { updateCarrierStatus } from "~/libs/carriers/utils/carrierHelpers";

export const action: ActionFunction = async ({ request }) => {
    try {
        const { shop, carrierName, isActive } = await request.json();

        if (!shop || !carrierName || isActive === undefined) {
            console.error('Missing required parameters:', { shop, carrierName, isActive });
            return json({ success: false, error: 'Missing required parameters' }, { status: 400 });
        }

        console.log('Attempting to update carrier status:', { shop, carrierName, isActive });
        await updateCarrierStatus(shop, carrierName, isActive);
        console.log('Carrier status updated successfully');
        return json({ success: true });
    } catch (error: unknown) {
        console.error('Error updating carrier status:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update carrier status';
        console.error('Detailed error:', errorMessage);
        return json({ success: false, error: errorMessage }, { status: 500 });
    }
};
