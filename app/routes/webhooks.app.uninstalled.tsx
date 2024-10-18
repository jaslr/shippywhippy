import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { prisma } from '~/prisma';

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const webhookResult = await authenticate.webhook(request);

    if (webhookResult instanceof Response) {
      return webhookResult;
    }

    const { shop, session, topic } = webhookResult;

    console.log(`Received ${topic} webhook for ${shop}`);

    if (session) {
      await db.session.deleteMany({ where: { shop } });
      await prisma.shop.update({
        where: { username: shop },
        data: { isActive: false, uninstalledAt: new Date() },
      });
      console.log(`Shop record updated for uninstallation: ${shop}`);
    }

    return new Response();
  } catch (error) {
    console.error('Error handling uninstalled webhook:', error);
    return new Response('', { status: 500 });
  }
};
