import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, CheckCircle, Clock, FileText, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function ClassroomAssignmentsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "STUDENT") redirect("/")

  const assignments = await prisma.assignment.findMany({
    include: {
      submissions: {
        where: { studentId: session.user.id }
      }
    },
    orderBy: { dueDate: "asc" },
  })

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Assignments</h1>
          <p className="text-slate-500 mt-1">Manage your coursework, submissions, and academic grades.</p>
        </div>
        <div className="flex gap-3">
          <Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
            Total: {assignments.length}
          </Badge>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignments.map((a) => {
          const submission = a.submissions[0]
          const isOverdue = new Date() > new Date(a.dueDate) && !submission

          return (
            <Card key={a.id} className={`flex flex-col transition-all hover:shadow-md border-slate-200 ${submission ? "bg-slate-50/40" : "bg-white"}`}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                     <FileText className={`h-4 w-4 ${submission ? "text-slate-400" : "text-indigo-600"}`} />
                     <CardTitle className="text-lg leading-none">{a.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    Due {new Date(a.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                {submission ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                    <CheckCircle className="mr-1 h-3 w-3" /> Submitted
                  </Badge>
                ) : isOverdue ? (
                  <Badge variant="destructive" className="animate-pulse">Overdue</Badge>
                ) : (
                  <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50/50">Pending</Badge>
                )}
              </CardHeader>
              
              <CardContent className="flex-1">
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {a.description}
                </p>
                
                {submission?.grade !== null && submission?.grade !== undefined && (
                  <div className="mt-4 p-3 bg-white border border-blue-100 text-blue-700 rounded-xl text-sm font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                       <CheckCircle className="h-4 w-4" /> Result Issued
                    </span>
                    <span className="text-lg">{submission.grade}<span className="text-xs text-blue-400">/100</span></span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-2">
                <Button 
                  variant={submission ? "secondary" : "default"} 
                  className={`w-full group ${!submission && "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100"}`}
                  asChild
                >
                  <Link href={`/classroom/assignments/${a.id}`}>
                    {submission ? "Review Submission" : "Submit Work"}
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {assignments.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
             <Clock className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No assignments yet</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-1">
            Your instructors haven't posted any coursework. Check back later!
          </p>
        </div>
      )}
    </div>
  )
}