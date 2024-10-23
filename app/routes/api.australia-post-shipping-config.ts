import { json, type ActionFunction } from '@remix-run/node';
import { prisma } from '~/prisma';
import { authenticate } from '../shopify.server';

export const action: ActionFunction = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const body = await request.json();

    console.log('📝 Received request to update shipping configuration:', body);

    const { carrierId, shippingCode, shippingName, isDisabled, isInternational } = body;
    
    try {
        // Get the shop by username
        const shop = await prisma.shop.findUnique({
            where: {
                username: session.shop // This is the shop domain from the session
            }
        });

        if (!shop) {
            console.error('❌ Shop not found:', { username: session.shop });
            return json({ success: false, error: 'Shop not found' }, { status: 404 });
        }

        console.log('✅ Found shop:', { username: shop.username });

        // Get the carrier config
        const carrierConfig = await prisma.carrierConfig.findUnique({
            where: {
                shopId_carrierId: {
                    shopId: shop.id,
                    carrierId: parseInt(carrierId)
                }
            }
        });

        if (!carrierConfig) {
            console.error('❌ Carrier configuration not found');
            return json({ success: false, error: 'Carrier configuration not found' }, { status: 404 });
        }

        if (isDisabled) {
            console.log('📝 Creating/Updating DisabledShippingRate record:', {
                carrierConfigId: carrierConfig.id,
                shippingCode,
                shippingName,
                isInternational
            });

            await prisma.disabledShippingRate.upsert({
                where: {
                    carrierConfigId_shippingCode: {  // This matches your unique constraint
                        carrierConfigId: carrierConfig.id,
                        shippingCode
                    }
                },
                update: {
                    shippingName,    // Update these fields if record exists
                    isInternational
                },
                create: {           // Create with all fields if doesn't exist
                    carrierConfigId: carrierConfig.id,
                    shippingCode,
                    shippingName,
                    isInternational,
                },
            });

            // Update hasDisabledRates flag
            await prisma.carrierConfig.update({
                where: { id: carrierConfig.id },
                data: { hasDisabledRates: true }
            });
        } else {
            console.log('🗑️ Removing DisabledShippingRate record');
            await prisma.disabledShippingRate.deleteMany({
                where: {
                    carrierConfigId: carrierConfig.id,
                    shippingCode,
                }
            });
        }

        return json({
            success: true,
            message: `Shipping rate ${shippingCode} has been ${isDisabled ? 'disabled' : 'enabled'}`,
        });
    } catch (error) {
        console.error('❌ Error updating shipping configuration:', error);
        return json({
            success: false,
            error: 'An error occurred while updating the shipping configuration',
        }, { status: 500 });
    }
};
