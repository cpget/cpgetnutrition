import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const announcement = await prisma.announcement.findUnique({
    where: { id: "GLOBAL" },
    include: { teacher: { select: { name: true, email: true } } },
  })

  return NextResponse.json(announcement)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  // 1. Check Authorization
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { title, content } = await req.json()

    // 2. Updated Validation: Only require content
    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    // 3. Upsert Logic: Use the provided title or default to empty string
    const announcement = await prisma.announcement.upsert({
      where: { id: "GLOBAL" },
      update: {
        title: title || "", // Handled if title is missing
        content: content.trim(),
        teacherId: session.user.id,
      },
      create: {
        id: "GLOBAL",
        title: title || "",
        content: content.trim(),
        teacherId: session.user.id,
      },
    })

    return NextResponse.json(announcement)
  } catch (error) {
    console.error("ANNOUNCEMENT_POST_ERROR:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await prisma.announcement.delete({
      where: { id: "GLOBAL" },
    })
    return NextResponse.json({ message: "Deleted" })
  } catch (error) {
    // Catching if the record doesn't exist to prevent 500 errors
    return NextResponse.json({ message: "No active announcement to delete" })
  }
}