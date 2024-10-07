import { Outlet, useLoaderData, useRouteError } from '@remix-run/react';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import shopify from '../shopify.server';
import { boundary } from "@shopify/shopify-app-remix/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await shopify.authenticate.admin(request);

  return json({
    shop: session.shop,
  });
};

export default function App() {
  const { shop } = useLoaderData<typeof loader>();

  return (
    <Outlet context={{ shop }} />
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = boundary.headers;
