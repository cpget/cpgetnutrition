import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { topic, meetingLink } = await req.json()

    // TRANSACTION: Delete all previous sessions and create the new one
    const result = await prisma.$transaction([
      prisma.liveClass.deleteMany({}), // Wipes old links automatically
      prisma.liveClass.create({
        data: {
          topic,
          meetingLink,
          teacherId: session.user.id,
          scheduledAt: new Date(),
        },
      }),
    ])

    return NextResponse.json(result[1])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update live session" }, { status: 500 })
  }
}