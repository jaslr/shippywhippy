import { json, type LoaderFunctionArgs } from '@remix-run/node';
import shopify from '../shopify.server';
import { prisma } from '../prisma';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const { admin, session } = await shopify.authenticate.admin(request);

    const { shop } = session;

    let shopData = await prisma.shop.findUnique({
        where: { username: shop },
    });

    let action = 'No change';

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
        action = 'Created';
    } else {
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
        action = 'Updated';
    }

    console.table({
        Action: action,
        ID: shopData.id,
        Username: shopData.username,
        ShopifyName: shopData.shopifyName,
        ShopifyURL: shopData.shopifyUrl,
        IsActive: shopData.isActive,
        DaysActive: shopData.daysActive,
        InstalledAt: shopData.installedAt,
    });

    return json({ shop, shopData });
};
