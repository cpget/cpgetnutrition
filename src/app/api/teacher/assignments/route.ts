import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const assignments = await prisma.assignment.findMany({
    where: { teacherId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(assignments)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const title = String(body.title || "").trim()
  const description = String(body.description || "").trim()
  const dueDate = String(body.dueDate || "").trim() // ISO string

  if (!title || !description || !dueDate) {
    return NextResponse.json(
      { error: "title, description, dueDate are required" },
      { status: 400 }
    )
  }

  const created = await prisma.assignment.create({
    data: {
      title,
      description,
      dueDate: new Date(dueDate),
      teacherId: session.user.id,
    },
  })

  return NextResponse.json(created)
}