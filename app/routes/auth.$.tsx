import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import shopify from '~/shopify.server';
import { prisma } from '~/prisma';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const authResult = await shopify.authenticate.admin(request);

    if (authResult instanceof Response) {
      return authResult;
    }

    const { session } = authResult;

    if (session) {
      const { shop } = session;
      console.log(`Authenticated session for ${shop}`);
      
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

    // If no session, redirect to auth
    return redirect('/auth');
  } catch (error) {
    console.error('Error in auth flow:', error);
    throw error;
  }
}
