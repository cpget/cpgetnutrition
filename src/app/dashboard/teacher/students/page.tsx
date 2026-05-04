import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import StudentsTable from "./StudentsTable"
import { Card, CardContent } from "@/components/ui/card"

export default async function StudentsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "TEACHER") {
    redirect("/")
  }

  // 🚀 PARALLEL FETCHING: All 4 queries start at the same time
  const [students, total, approved, pending] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({
      where: { role: "STUDENT" },
    }),
    prisma.user.count({
      where: { role: "STUDENT", isApproved: true },
    }),
    prisma.user.count({
      where: { role: "STUDENT", isApproved: false },
    }),
  ])

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Student Management</h1>
        <p className="text-muted-foreground">
          Approve and manage registered students
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-sm">Total Students</p>
            <p className="text-3xl font-bold mt-2">{total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-sm">Approved</p>
            <p className="text-3xl font-bold mt-2 text-green-600">{approved}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-sm">Pending Approval</p>
            <p className="text-3xl font-bold mt-2 text-yellow-600">{pending}</p>
          </CardContent>
        </Card>
      </div>

      {students.length === 0 ? (
        <div className="p-6 border rounded text-center text-muted-foreground">
          No students have registered yet.
        </div>
      ) : (
        <StudentsTable students={students} />
      )}
    </div>
  )
}