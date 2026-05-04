import { PrismaClient, Role } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("areeb2004", 10)

  const teacher = await prisma.user.upsert({
    where: { email: "cpgetnutrition@gmail.com" },
    update: {},
    create: {
      name: "Main Teacher",
      email: "cpgetnutrition@gmail.com",
      password: hashedPassword,
      role: Role.TEACHER,
      isApproved: true,
      emailVerified: new Date(),
    },
  })

  console.log("✅ Teacher created:", teacher.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })