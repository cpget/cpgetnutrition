import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // 1. Safety Check: Is the user logged in and a teacher?
    if (!session?.user?.id || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Unauthorized. Please log in again." }, 
        { status: 401 }
      )
    }

    // 2. Extract data including 'duration'
    const { title, description, duration, questions, isDraft } = await req.json()

    // 3. Validate input
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Title and at least one question are required." }, 
        { status: 400 }
      )
    }

    // 4. Create the Quiz in the database
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        // Convert duration to number, default to 30 if missing
        duration: parseInt(duration) || 30,
        isDraft: isDraft === true, // Save draft state
        teacher: {
          connect: { id: session.user.id }
        },
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            answer: q.answer,
          }))
        }
      },
      include: {
        questions: true // Returns the questions back in the response
      }
    })

    console.log(`✅ Quiz Created: "${title}" (Draft: ${isDraft}) with ${questions.length} questions and ${duration}min timer.`);

    return NextResponse.json(quiz)

  } catch (error: any) {
    console.error("QUIZ_CREATE_ERROR:", error)
    return NextResponse.json(
      { error: "Internal Server Error. Please check your database connection." }, 
      { status: 500 }
    )
  }
}