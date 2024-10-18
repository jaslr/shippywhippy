import { json, type LoaderFunctionArgs } from '@remix-run/node';
import shopify from '../shopify.server';
import { prisma } from '../prisma';

export const loader = async ({ request }: LoaderFunctionArgs) => {
    try {
        const { admin, session } = await shopify.authenticate.admin(request);

        if (!session) {
            console.error('No session found in shop-info loader.');
            return json({ success: false, error: 'No session found' }, { status: 401 });
        }

        const { shop } = session;

        // Use admin.rest.resources to make API calls
        const shopResponse = await admin.rest.resources.Shop.all({
            session: session,
        });

        let shopData = await prisma.shop.findUnique({
            where: { username: shop },
        });

        let action = 'No change';

        if (!shopData) {
            const shopInfo = shopResponse.data[0];
            const shopUrl = shopInfo.myshopify_domain || shop;

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
            const shopInfo = shopResponse.data[0];
            const shopUrl = shopInfo.myshopify_domain || shop;

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
    } catch (error) {
        console.error('Error in shop-info loader:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve shop info';
        return json({ success: false, error: errorMessage }, { status: 500 });
    }
};
