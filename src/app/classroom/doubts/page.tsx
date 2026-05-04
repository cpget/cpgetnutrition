import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import StudentDoubts from "./StudentDoubts"

export default async function ClassroomDoubtsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "STUDENT") {
    redirect("/")
  }

  const doubts = await prisma.doubt.findMany({
    where: { studentId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  // ✅ Convert Date -> string so Client doesn't re-format differently
  const safeDoubts = doubts.map((d) => ({
    ...d,
    createdAt: d.createdAt.toISOString(),
    answeredAt: d.answeredAt ? d.answeredAt.toISOString() : null,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Doubts</h1>
      <StudentDoubts doubts={safeDoubts} />
    </div>
  )
}