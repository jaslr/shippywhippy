import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import shopify from '~/shopify.server';
import { prisma } from '~/prisma';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const { session } = await shopify.authenticate.admin(request);

    if (session) {
      const { shop } = session;
      console.log(`Attempting to upsert shop record for ${shop}`);
      
      const shopData = await prisma.shop.upsert({
        where: { username: shop },
        update: { isActive: true },
        create: {
          username: shop,
          shopifyName: shop,
          shopifyUrl: `https://${shop}`,
          isActive: true,
        },
      });

      console.log(`Shop record upserted:`, shopData);
      return redirect('/app');
    }

    // If no session, start the auth process
    return await shopify.authenticate.admin(request);
  } catch (error) {
    console.error('Error in auth flow:', error);
    throw error;
  }
}
