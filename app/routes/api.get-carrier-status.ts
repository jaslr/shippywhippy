import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import { prisma } from "../prisma";
import shopify from "../shopify.server";

export const action: ActionFunction = async ({ request }) => {
    try {
        const { admin, session } = await shopify.authenticate.admin(request);
        const formData = await request.formData();
        const carrierName = formData.get('carrierName') as string;

        if (!session.shop || !carrierName) {
            return json({ success: false, error: "Missing shop or carrierName" }, { status: 400 });
        }

        const shop = await prisma.shop.findUnique({
            where: { username: session.shop },
        });

        if (!shop) {
            return json({ success: false, error: "Shop not found" }, { status: 404 });
        }

        const carrier = await prisma.carrier.findUnique({
            where: { name: carrierName },
        });

        if (!carrier) {
            return json({ success: false, error: "Carrier not found" }, { status: 404 });
        }

        const carrierConfig = await prisma.carrierConfig.findUnique({
            where: {
                shopId_carrierId: {
                    shopId: shop.id,
                    carrierId: carrier.id,
                }
            },
        });

        if (!carrierConfig) {
            return json({ success: false, error: "Carrier configuration not found" }, { status: 404 });
        }

        return json({ success: true, isActive: carrierConfig.isActive });
    } catch (error) {
        console.error('Error in get-carrier-status action:', error);
        return json({ success: false, error: "Failed to retrieve carrier status" }, { status: 500 });
    }
};

export const loader = async () => {
    return json({ error: "Method not allowed" }, { status: 405 });
};