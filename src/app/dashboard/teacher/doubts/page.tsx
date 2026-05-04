import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import TeacherDoubtsTabs from "@/components/TeacherDoubtsTabs"

export default async function TeacherDoubtsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "TEACHER") {
    redirect("/")
  }

  const doubts = await prisma.doubt.findMany({
  orderBy: [
    { answer: "asc" },       // 🔥 unanswered first (null first)
    { createdAt: "desc" },   // newest first
  ],
  include: {
    student: {
      select: {
        name: true,
        email: true,
      },
    },
  },
})

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Student Doubts</h1>
      <TeacherDoubtsTabs doubts={doubts} />
    </div>
  )
}