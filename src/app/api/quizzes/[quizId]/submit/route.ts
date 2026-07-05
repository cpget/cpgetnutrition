import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> } 
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { quizId } = await params 
    const { answers } = await req.json() // Format expected: { "questionId": "A", ... }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    })

    if (!quiz) return NextResponse.json({ error: "Mock Test not found" }, { status: 404 })

    // Check if student has already taken this Mock Test
    const existingAttempt = await prisma.quizAttempt.findFirst({
      where: { quizId, studentId: session.user.id },
    })

    if (existingAttempt) {
      return NextResponse.json({ error: "You have already submitted this test." }, { status: 400 })
    }

    // Server-side score calculation
    let score = 0
    quiz.questions.forEach((q) => {
      const userAns = answers[q.id]
      const selectedOption = typeof userAns === 'object' && userAns !== null 
        ? (userAns as any).selectedAnswer 
        : userAns
      if (selectedOption === q.answer) score++
    })

    // Create the attempt record and lock the quiz
    const attempt = await prisma.$transaction(async (tx) => {
      const att = await tx.quizAttempt.create({
        data: { 
          score, 
          quizId, 
          studentId: session.user.id,
          answers: answers, // CRITICAL: Save this for the Review Page
        },
      })
      await tx.quiz.update({
        where: { id: quizId },
        data: { isLocked: true },
      })
      return att
    })

    return NextResponse.json({ 
      success: true, 
      score, 
      totalQuestions: quiz.questions.length,
      attemptId: attempt.id // Return the ID so we can redirect to the results page
    })
  } catch (error) {
    console.error("SUBMISSION_ERROR:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}