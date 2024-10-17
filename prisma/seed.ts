import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.carrier.upsert({
    where: { name: 'Australia Post' },
    update: { defaultApiKey: 'your_australia_post_default_api_key' },
    create: { name: 'Australia Post', defaultApiKey: 'your_australia_post_default_api_key' },
  })

  await prisma.carrier.upsert({
    where: { name: 'Aramex' },
    update: { defaultApiKey: 'your_aramex_default_api_key' },
    create: { name: 'Aramex', defaultApiKey: 'your_aramex_default_api_key' },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.()
  })
