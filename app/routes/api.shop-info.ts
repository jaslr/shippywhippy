import { json, type LoaderFunctionArgs } from '@remix-run/node';
import shopify from '../shopify.server';
import { prisma } from '~/prisma';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { admin, session } = await shopify.authenticate.admin(request);
    if (!session) return json({ error: 'No session' }, { status: 401 });

    const { shop } = session;
    const shopResponse = await admin.rest.get({
      path: 'shop',
    });

    // Fetch locations
    const locationsResponse = await admin.graphql(`
      query {
        locations(first: 10) {
          edges {
            node {
              id
              name
              address {
                address1
                address2
                city
                provinceCode
                zip
                countryCode
              }
              isActive
              fulfillsOnlineOrders
            }
          }
        }
      }
    `);

    const locationsData = await locationsResponse.json();

    console.log('Shop Info:', JSON.stringify(shopResponse.body, null, 2));
    console.log('Locations:', JSON.stringify(locationsData, null, 2));

    // Update the shop's information in the database
    if (locationsData.data.locations.edges.length > 0) {
      const primaryLocation = locationsData.data.locations.edges[0].node;
      await prisma.shop.update({
        where: { username: shop }, // Assuming 'shop' is the username
        data: {
          // Add fields that exist in your Shop model
          // For example:
          // postalCode: primaryLocation.address.zip,
          // You might need to add other fields here based on your schema
        },
      });
    }

    return json({ 
      shop, 
      shopData: shopResponse.body, 
      locations: locationsData.data.locations.edges 
    });
  } catch (error) {
    if (error instanceof Response && error.status === 410) {
      return json({ error: 'App needs to be reinstalled' }, { status: 403 });
    }
    console.error('Error in shop-info loader:', error);
    return json({ error: 'Failed to retrieve shop info' }, { status: 500 });
  }
};
