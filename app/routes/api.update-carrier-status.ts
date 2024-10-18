import { json, type ActionFunctionArgs } from "@remix-run/node";
import shopify from "../shopify.server";
import { updateCarrierStatus } from "~/libs/carriers/utils/carrierHelpers";

export async function action({ request }: ActionFunctionArgs) {
    const { admin, session } = await shopify.authenticate.admin(request);

    if (!session) {
        return json({ error: "No session found" }, { status: 401 });
    }

    const formData = await request.formData();
    const carrierName = formData.get("carrierName") as string;
    const isActive = formData.get("isActive") === "true";

    try {
        await updateCarrierStatus(session.shop, carrierName, isActive);
        return json({ success: true });
    } catch (error: unknown) {
        console.error("Error updating carrier status:", error);
        if (error instanceof Error) {
            return json({ error: error.message }, { status: 500 });
        }
        return json({ error: "An unknown error occurred" }, { status: 500 });
    }
}
