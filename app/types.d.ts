// app/types.d.ts

import { Shop as PrismaShop } from '@prisma/client';

declare global {
    interface Shop extends PrismaShop {
        postalCode?: string | null;
    }
}

