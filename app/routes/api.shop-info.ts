import { json, type LoaderFunctionArgs } from '@remix-run/node';
import shopify from '../shopify.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { admin, session } = await shopify.authenticate.admin(request);
    if (!session) return json({ error: 'No session' }, { status: 401 });

    const { shop } = session;
    const shopResponse = await admin.rest.get({
      path: 'shop',
    });

    console.log('Shop Info:', JSON.stringify(shopResponse.body, null, 2));
    return json({ shop, shopData: shopResponse.body });
  } catch (error) {
    if (error instanceof Response && error.status === 410) {
      return json({ error: 'App needs to be reinstalled' }, { status: 403 });
    }
    console.error('Error in shop-info loader:', error);
    return json({ error: 'Failed to retrieve shop info' }, { status: 500 });
  }
};