import { Outlet, useLoaderData, useRouteError } from '@remix-run/react';
import { json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import shopify from '../shopify.server';
import { boundary } from "@shopify/shopify-app-remix/server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await shopify.authenticate.admin(request);

  // If we have a valid session, return it without re-authenticating
  if (session) {
    return json({
      shop: session.shop,
    });
  }

  // If no session, redirect to auth
  return redirect('/auth');
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
