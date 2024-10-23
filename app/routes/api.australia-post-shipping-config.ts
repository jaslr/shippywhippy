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
        location,
        postalCode,
        countryCode
    } = body;
    
    try {
        const shop = await prisma.shop.findUnique({
            where: { username: session.shop },
            include: { carriers: true }
        });

        console.log('✅ Found shop:', { username: session.shop });

        if (isDisabled) {
            console.log('📝 Creating/Updating DisabledShippingRate record:', {
                carrierConfigId: carrierId,
                shippingCode,
                shippingName,
                isInternational
            });

            // First generate Prisma client with new schema
            await prisma.$executeRaw`
                CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
                    "id" SERIAL,
                    "checksum" VARCHAR(64) NOT NULL,
                    "finished_at" TIMESTAMP WITH TIME ZONE,
                    "migration_name" VARCHAR(255) NOT NULL,
                    "logs" TEXT,
                    "rolled_back_at" TIMESTAMP WITH TIME ZONE,
                    "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
                    PRIMARY KEY ("id")
                );
            `;

            // Create the record
            await prisma.disabledShippingRate.create({
                data: {
                    carrierConfig: {
                        connect: { id: carrierId }
                    },
                    shippingCode,
                    shippingName,
                    isInternational,
                    location: location || '',  // Provide default values
                    postalCode: postalCode || '',
                    countryCode: isInternational ? countryCode : null
                }
            });

            return json({
                success: true,
                message: `${isInternational ? 'International' : 'Domestic'} shipping rate ${shippingName} has been disabled`
            });
        } else {
            // Delete the record
            await prisma.disabledShippingRate.deleteMany({
                where: {
                    carrierConfigId: carrierId,
                    shippingCode,
                    location: location || '',
                    postalCode: postalCode || ''
                }
            });

            return json({
                success: true,
                message: `Shipping rate ${shippingName} has been enabled`
            });
        }
    } catch (error) {
        console.error('❌ Error updating shipping configuration:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }, { status: 500 });
    }
};
