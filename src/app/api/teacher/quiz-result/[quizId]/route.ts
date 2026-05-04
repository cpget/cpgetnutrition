import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// 🗑️ DELETE QUIZ
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { quizId } = await params

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure the teacher owns this quiz before deleting
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } })
    if (!quiz || quiz.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Transaction to delete everything related
    await prisma.$transaction([
      prisma.question.deleteMany({ where: { quizId } }),
      prisma.quizAttempt.deleteMany({ where: { quizId } }),
      prisma.quiz.delete({ where: { id: quizId } }),
    ])

    return NextResponse.json({ message: "Quiz deleted successfully" })
  } catch (error) {
    console.error("DELETE_ERROR:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}

// ✏️ EDIT (UPDATE) QUIZ
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { quizId } = await params
    const { title, description, duration, questions } = await req.json()

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use a transaction to update quiz and reset questions
    await prisma.$transaction([
      prisma.quiz.update({
        where: { id: quizId },
        data: { 
          title, 
          description, 
          duration: parseInt(duration) 
        }
      }),
      // Delete old questions and insert new ones to avoid complex diff logic
      prisma.question.deleteMany({ where: { quizId } }),
      prisma.question.createMany({
        data: questions.map((q: any) => ({
          quizId,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          answer: q.answer,
        }))
      })
    ])

    return NextResponse.json({ message: "Quiz updated successfully" })
  } catch (error) {
    console.error("UPDATE_ERROR:", error)
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
}