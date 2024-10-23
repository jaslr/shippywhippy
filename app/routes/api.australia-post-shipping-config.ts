import { json, type ActionFunction, type LoaderFunction } from '@remix-run/node';
import { prisma } from '~/prisma';
import { authenticate } from '../shopify.server';

export const loader: LoaderFunction = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    
    try {
        const shop = await prisma.shop.findUnique({
            where: { username: session.shop },
            include: {
                carriers: {
                    include: {
                        disabledRates: true
                    }
                }
            }
        });

        if (!shop) {
            return json({ success: false, error: 'Shop not found' }, { status: 404 });
        }

        const disabledRates = shop.carriers
            .flatMap(config => config.disabledRates)
            .map(rate => ({
                shippingCode: rate.shippingCode,
                shippingName: rate.shippingName,
                isInternational: rate.isInternational
            }));

        return json({
            success: true,
            disabledRates
        });
    } catch (error) {
        console.error('Error fetching disabled rates:', error);
        return json({
            success: false,
            error: 'Failed to fetch disabled rates'
        }, { status: 500 });
    }
};

export const action: ActionFunction = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const body = await request.json();

    const { 
        carrierId, 
        shippingCode, 
        shippingName, 
        isDisabled, 
        isInternational,
        location,     // Add these new fields
        postalCode,
        countryCode   // Optional for international
    } = body;
    
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

            // First try to find existing record
            const existingRate = await prisma.disabledShippingRate.findFirst({
                where: {
                    AND: [
                        { carrierConfigId: carrierConfig.id },
                        { shippingCode },
                        { location: location || '' },
                        { postalCode: postalCode || '' }
                    ]
                }
            });

            if (existingRate) {
                // Update existing record
                await prisma.disabledShippingRate.update({
                    where: { id: existingRate.id },
                    data: {
                        shippingName,
                        isInternational,
                        countryCode: isInternational ? countryCode || null : null,
                        location: location || '',
                        postalCode: postalCode || ''
                    }
                });
            } else {
                // Create new record
                await prisma.disabledShippingRate.create({
                    data: {
                        carrierConfigId: carrierConfig.id,
                        shippingCode,
                        shippingName,
                        isInternational,
                        location: location || '',
                        postalCode: postalCode || '',
                        countryCode: isInternational ? countryCode || null : null
                    }
                });
            }

            // Update hasDisabledRates flag
            await prisma.carrierConfig.update({
                where: { id: carrierConfig.id },
                data: { hasDisabledRates: true }
            });

            return json({
                success: true,
                message: `${isInternational ? 'International' : 'Domestic'} shipping rate ${shippingCode} has been disabled`,
                details: {
                    restrictions: isInternational ? [
                        'authority_to_leave must not be specified',
                        'safe_drop_enabled must not be specified'
                    ] : []
                }
            });
        } else {
            console.log('🗑️ Removing DisabledShippingRate record');
            await prisma.disabledShippingRate.deleteMany({
                where: {
                    carrierConfigId: carrierConfig.id,
                    shippingCode,
                }
            });

            return json({
                success: true,
                message: `Shipping rate ${shippingCode} has been enabled`,
            });
        }
    } catch (error) {
        console.error('❌ Error updating shipping configuration:', error);
        return json({
            success: false,
            error: 'An error occurred while updating the shipping configuration',
        }, { status: 500 });
    }
};
