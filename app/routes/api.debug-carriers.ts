import { json, type LoaderFunction } from '@remix-run/node';
import { prisma } from '~/prisma';

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    let shopUrl = url.searchParams.get('shop');

    if (!shopUrl) {
        return json({ error: "Shop URL is required" }, { status: 400 });
    }

    // Remove 'https://' if present and trailing slash
    shopUrl = shopUrl.replace('https://', '').replace(/\/$/, '');

    console.log("Querying for shop:", shopUrl);

    const shop = await prisma.shop.findFirst({
        where: {
            shopifyUrl: `https://${shopUrl}`,
        },
    });

    console.log("Shop found:", shop);

    if (!shop) {
        console.log("Shop not found:", shopUrl);
        return json({ error: "Shop not found" }, { status: 404 });
    }

    const activeCarriers = await prisma.carrierConfig.findMany({
        where: {
            isActive: true,
            shopId: shop.id
        },
        include: {
            carrier: true,
            shop: {
                select: {
                    id: true,
                    shopifyName: true,
                    shopifyUrl: true,
                    isActive: true,
                }
            },
        },
    });

    console.log("Found carriers:", JSON.stringify(activeCarriers, null, 2));

    if (activeCarriers.length === 0) {
        console.log("No active carriers found for shop:", shopUrl);
    }

    return json({ shopCarriers: activeCarriers });
};
