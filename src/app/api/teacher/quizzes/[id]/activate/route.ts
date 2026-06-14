import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if the quiz exists
    const quizExists = await prisma.quiz.findUnique({
      where: { id },
    })

    if (!quizExists) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Set all quizzes to inactive and the selected quiz to active in a transaction
    await prisma.$transaction([
      prisma.quiz.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      }),
      prisma.quiz.update({
        where: { id },
        data: { isActive: true },
      }),
    ])

    return NextResponse.json({ success: true, message: "Mock test activated successfully" })
  } catch (error) {
    console.error("ACTIVATE_QUIZ_ERROR:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
