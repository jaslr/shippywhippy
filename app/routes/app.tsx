import { useEffect } from 'react';
import { useLoaderData } from '@remix-run/react';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import shopify from '../shopify.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await shopify.authenticate.admin(request);

  return json({
    shop: session.shop,
  });
};

export default function App() {
  const { shop } = useLoaderData<typeof loader>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        console.log('Products:', data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Welcome to your Shopify app, {shop}!</h1>
      {/* Rest of your component */}
    </div>
  );
}
