import { json, type ActionFunctionArgs } from "@remix-run/node";
import shopify from "../../shopify.server";
import { prisma } from "../../prisma";
import { getCarrierByName } from "../../libs/carriers/carrierlist";

export async function action({ request }: ActionFunctionArgs) {
    const { admin, session } = await shopify.authenticate.admin(request);

    if (!session) {
        return json({ error: "No session found" }, { status: 401 });
    }

    const formData = await request.formData();
    const carrierName = formData.get("carrierName") as string;
    const apiKey = formData.get("apiKey") as string;

    try {
        const carrier = getCarrierByName(carrierName);
        if (!carrier) {
            throw new Error('Carrier not found');
        }

        const shopRecord = await prisma.shop.findUnique({
            where: { username: session.shop },
        });

        if (!shopRecord) {
            throw new Error('Shop not found');
        }

        await prisma.carrierConfig.upsert({
            where: {
                shopId_carrierId: {
                    shopId: shopRecord.id,
                    carrierId: parseInt(carrier.id),
                }
            },
            update: {
                apiKey,
            },
            create: {
                shopId: shopRecord.id,
                carrierId: parseInt(carrier.id),
                apiKey,
            },
        });

        return json({ success: true });
    } catch (error) {
        console.error('Error saving API key:', error);
        return json({ error: 'Failed to save API key' }, { status: 500 });
    }
}
