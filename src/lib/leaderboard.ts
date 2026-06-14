import prisma from "@/lib/prisma"

export interface LeaderboardEntry {
  rank: number
  studentId: string
  name: string
  email: string
  score: number
  submittedAt: Date
  percentage: number
  percentile: number
  topPercentage: number
}

export async function getCurrentMockLeaderboard(studentId?: string) {
  try {
    // 1. Fetch the currently active quiz
    const activeQuiz = await prisma.quiz.findFirst({
      where: { isActive: true },
      include: {
        questions: {
          select: { id: true }
        }
      }
    })

    if (!activeQuiz) {
      return {
        quiz: null,
        topFive: [],
        currentStudentRank: null,
        currentStudentScore: null,
        totalParticipants: 0,
      }
    }

    const totalQuestions = activeQuiz.questions.length

    // 2. Retrieve all attempts belonging only to the active quiz
    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId: activeQuiz.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    // 3. Sort attempts
    // Primary: score descending
    // Tie-breaker: submittedAt ascending (earliest submission first)
    const sortedAttempts = [...attempts].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score
      }
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    })

    const totalParticipants = sortedAttempts.length

    // 4. Map to final structure with ranks
    const mappedEntries: LeaderboardEntry[] = sortedAttempts.map((attempt, index) => {
      const rank = index + 1
      const percentile = totalParticipants > 0 ? ((totalParticipants - rank) / totalParticipants) * 100 : 0
      const topPercentage = totalParticipants > 0 ? Math.max(1, Math.round((rank / totalParticipants) * 100)) : 100
      return {
        rank,
        studentId: attempt.student.id,
        name: attempt.student.name,
        email: attempt.student.email,
        score: attempt.score,
        submittedAt: attempt.submittedAt,
        percentage: totalQuestions > 0 ? Math.round((attempt.score / totalQuestions) * 100) : 0,
        percentile,
        topPercentage,
      }
    })

    // 5. Get current student details
    let currentStudentRank: number | null = null
    let currentStudentScore: number | null = null
    let currentStudentPercentile: number | null = null
    let currentStudentTopPercentage: number | null = null

    if (studentId) {
      const studentIndex = mappedEntries.findIndex(e => e.studentId === studentId)
      if (studentIndex !== -1) {
        currentStudentRank = studentIndex + 1
        currentStudentScore = mappedEntries[studentIndex].score
        currentStudentPercentile = mappedEntries[studentIndex].percentile
        currentStudentTopPercentage = mappedEntries[studentIndex].topPercentage
      }
    }

    const topFive = mappedEntries.slice(0, 5)

    return {
      quiz: {
        id: activeQuiz.id,
        title: activeQuiz.title,
        description: activeQuiz.description,
        totalQuestions,
      },
      topFive,
      currentStudentRank,
      currentStudentScore,
      currentStudentPercentile,
      currentStudentTopPercentage,
      totalParticipants: mappedEntries.length,
    }
  } catch (error) {
    console.error("Error calculating mock test leaderboard:", error)
    return {
      quiz: null,
      topFive: [],
      currentStudentRank: null,
      currentStudentScore: null,
      currentStudentPercentile: null,
      currentStudentTopPercentage: null,
      totalParticipants: 0,
    }
  }
}
