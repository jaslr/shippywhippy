import { json, type LoaderFunctionArgs } from '@remix-run/node';
import shopify from '../shopify.server';
import { prisma } from '../prisma';

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const { admin, session } = await shopify.authenticate.admin(request);

	const { shop } = session;

	let user = await prisma.user.findUnique({
		where: { username: shop },
	});

	if (!user) {
		const shopData = await admin.rest.resources.Shop.all({ session });
		const shopInfo = shopData.data[0];
		const shopUrl = shopInfo?.myshopify_domain || shop;

		user = await prisma.user.create({
			data: {
				username: shop,
				shopifyName: shopUrl,
				// Remove shopUrl from here
			},
		});
	} else {
		// Update existing user with latest Shopify data
		const shopData = await admin.rest.resources.Shop.all({ session });
		const shopInfo = shopData.data[0];
		const shopUrl = shopInfo?.myshopify_domain || shop;

		user = await prisma.user.update({
			where: { id: user.id },
			data: {
				shopifyName: shopUrl,
				// Remove shopUrl from here
			},
		});
	}

	return json({ shop, user });
};