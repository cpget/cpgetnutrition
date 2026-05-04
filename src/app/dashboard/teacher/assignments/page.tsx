import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Users, 
  FileText, 
  ChevronRight, 
  Plus, 
  ClipboardList,
  Clock
} from "lucide-react"
import Link from "next/link"
import CreateAssignmentDialog from "./CreateAssignmentDialog"
import DeleteAssignmentButton from "./DeleteAssignmentButton"

export default async function TeacherAssignmentsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "TEACHER") redirect("/")

  // Fetch assignments along with the count of submissions for each
  const items = await prisma.assignment.findMany({
    where: { teacherId: session.user.id },
    include: {
      _count: {
        select: { submissions: true }
      }
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-indigo-600" />
            Curriculum Assignments
          </h1>
          <p className="text-slate-500 text-lg">Create, monitor, and grade student submissions.</p>
        </div>
        <CreateAssignmentDialog />
      </div>

      {/* Statistics Overview (Optional but professional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Active Assignments" value={items.length} icon={<FileText className="h-5 w-5" />} color="text-blue-600" bg="bg-blue-50" />
        {/* You could add more logic to calculate total submissions or pending grades here */}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6">
        {items.map((a) => (
          <Card key={a.id} className="group border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              {/* Left Side: Assignment Info */}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors">
                      {a.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="h-4 w-4" />
                        Due: {new Date(a.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        <Users className="h-4 w-4" />
                        {a._count.submissions} Submissions
                      </span>
                    </div>
                  </div>
                  <DeleteAssignmentButton id={a.id} />
                </div>
                
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 italic mb-4">
                  {a.description}
                </p>

                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-2 border-slate-200 hover:bg-slate-50" asChild>
                    <Link href={`/dashboard/teacher/assignments/${a.id}`}>
                      View Submissions <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {items.length === 0 && (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
               <Plus className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No assignments created</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-1">
              Start building your curriculum by creating your first assignment.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Simple internal component for the stats row
function StatsCard({ title, value, icon, color, bg }: any) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`rounded-xl ${bg} ${color} p-3`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}