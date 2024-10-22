import { json, type LoaderFunction } from '@remix-run/node';
import { authenticate } from '../shopify.server';

export const loader: LoaderFunction = async ({ request }) => {
    try {
        const { admin } = await authenticate.admin(request);

        const response = await admin.graphql(
            `query {
                locations(first: 50) {
                    edges {
                        node {
                            id
                            name
                            address {
                                zip
                                formatted
                            }
                        }
                    }
                }
            }`
        );

        const {
            data: {
                locations: { edges },
            },
        } = await response.json();

        const locations = edges.map(({ node }: any) => ({
            id: node.id,
            name: node.name,
            postalCode: node.address.zip,
            address: node.address.formatted,
        }));

        return json({ locations });
    } catch (error) {
        console.error('Error fetching Shopify locations:', error);
        return json({ error: 'Failed to fetch locations' }, { status: 500 });
    }
};