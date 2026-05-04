import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const doubts = await prisma.doubt.findMany({
    where: { studentId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(doubts)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { question } = await req.json()

  if (!question || typeof question !== "string" || !question.trim()) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 })
  }

  const doubt = await prisma.doubt.create({
    data: {
      question: question.trim(),
      studentId: session.user.id,
    },
  })

  return NextResponse.json(doubt)
}