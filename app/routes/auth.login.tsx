import { LoaderFunctionArgs } from "@remix-run/node";
import shopify from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await shopify.login(request);
  return null;
}