import { json, type LoaderFunction } from '@remix-run/node';
import { prisma } from '~/prisma';

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const shopUrl = url.searchParams.get('shop');

    if (!shopUrl) {
        return json({ error: "Shop URL is required" }, { status: 400 });
    }

    const shopCarriers = await prisma.carrierConfig.findMany({
        where: {
            shop: {
                shopifyUrl: shopUrl,
            },
        },
        include: {
            carrier: true,
            shop: true,
        },
    });

    return json({ shopCarriers });
};
