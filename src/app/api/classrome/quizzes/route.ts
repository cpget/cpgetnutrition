import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Fetch all quizzes and include the current student's attempt if it exists
  const quizzes = await prisma.quiz.findMany({
    include: {
      attempts: {
        where: { studentId: session.user.id }
      },
      _count: { select: { questions: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json(quizzes)
}