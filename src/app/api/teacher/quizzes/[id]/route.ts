import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Changed quizId to id
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const quiz = await prisma.quiz.findUnique({ where: { id } })
    if (!quiz || quiz.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.$transaction([
      prisma.question.deleteMany({ where: { quizId: id } }),
      prisma.quizAttempt.deleteMany({ where: { quizId: id } }),
      prisma.quiz.delete({ where: { id } }),
    ])

    return NextResponse.json({ message: "Mock Test deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Changed quizId to id
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params
    const { title, description, duration, questions, isDraft } = await req.json()

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      select: { isLocked: true }
    })

    if (!quiz) {
      return NextResponse.json({ error: "Mock Test not found" }, { status: 404 })
    }

    await prisma.$transaction([
      prisma.quiz.update({
        where: { id },
        data: { 
          title, 
          description, 
          duration: parseInt(duration),
          isDraft: isDraft === true
        }
      }),
      prisma.question.deleteMany({ where: { quizId: id } }),
      prisma.question.createMany({
        data: questions.map((q: any) => ({
          quizId: id,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          answer: q.answer,
        }))
      })
    ])

    return NextResponse.json({ message: "Mock Test updated successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}