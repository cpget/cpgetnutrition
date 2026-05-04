import { PrismaClient } from "@prisma/client"

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'info', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  })

  // This listener makes query logs much more visible in your terminal
  // @ts-ignore
  client.$on('query', (e: any) => {
    console.log(`\x1b[36mprisma:query\x1b[0m ${e.query} \x1b[33mparams:\x1b[0m ${e.params}`);
  });

  return client
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma