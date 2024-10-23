// When processing the installation/auth
const shop = await prisma.shop.upsert({
  where: { 
    shopifyUrl: session.shop 
  },
  update: {
    isActive: true,
    uninstalledAt: null
  },
  create: {
    username: session.shop.split('.')[0],
    shopifyName: session.shop,
    shopifyUrl: session.shop,
    isActive: true,
    installedAt: new Date(),
    daysActive: 0
  }
});

// Then link the session to the shop
await prisma.session.update({
  where: { id: session.id },
  data: { shopId: shop.id }
});
