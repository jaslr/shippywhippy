import { json, type LoaderFunctionArgs } from '@remix-run/node';
import shopify from '../shopify.server';
import { prisma } from '../prisma';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin, session } = await shopify.authenticate.admin(request);

    const { shop } = session;

    let shopData = await prisma.shop.findUnique({
        where: { username: shop },
    });

    if (!shopData) {
        const shopifyData = await admin.rest.resources.Shop.all({ session });
        const shopInfo = shopifyData.data[0];
        const shopUrl = shopInfo?.myshopify_domain || shop;

        shopData = await prisma.shop.create({
            data: {
                username: shop,
                shopifyName: shopUrl,
                shopifyUrl: shopUrl,
                isActive: true,
            },
        });
    } else {
        // Update existing shop with latest Shopify data
        const shopifyData = await admin.rest.resources.Shop.all({ session });
        const shopInfo = shopifyData.data[0];
        const shopUrl = shopInfo?.myshopify_domain || shop;

        shopData = await prisma.shop.update({
            where: { id: shopData.id },
            data: {
                shopifyName: shopUrl,
                shopifyUrl: shopUrl,
                isActive: true,
            },
        });
    }

    return json({ shop, shopData });
};