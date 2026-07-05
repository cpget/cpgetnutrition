import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, BookOpen, Trophy } from "lucide-react"
// import { format } from "date-fns"

export default async function TeacherQuizDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: true,
      attempts: {
        include: { student: true },
        orderBy: { score: "desc" },
      },
    },
  })

  if (!quiz) return <div className="p-10">Mock Test not found.</div>

  const avgScore = quiz.attempts.length > 0 
    ? (quiz.attempts.reduce((acc, curr) => acc + curr.score, 0) / quiz.attempts.length).toFixed(1)
    : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={quiz.attempts.length} icon={<Users className="text-blue-600" />} />
        <StatCard title="Questions" value={quiz.questions.length} icon={<BookOpen className="text-purple-600" />} />
        <StatCard title="Duration" value={`${quiz.duration}m`} icon={<Clock className="text-orange-600" />} />
        <StatCard title="Avg. Score" value={avgScore} icon={<Trophy className="text-yellow-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Student Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="text-left pb-3">Rank</th>
                  <th className="text-left pb-3">Student</th>
                  <th className="text-left pb-3">Score</th>
                  <th className="text-left pb-3">Tab Switches</th>
                  <th className="text-left pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {quiz.attempts.map((attempt, index) => {
                  const rawAns = (attempt.answers as any) || {}
                  const switchCount = rawAns?._metadata?.tabSwitchCount ?? 0

                  return (
                    <tr key={attempt.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-bold text-slate-400">#{index + 1}</td>
                      <td className="py-4 font-medium">{attempt.student.name}</td>
                      <td className="py-4">
                        <Badge variant={attempt.score > quiz.questions.length / 2 ? "default" : "destructive"}>
                          {attempt.score} / {quiz.questions.length}
                        </Badge>
                      </td>
                      <td className="py-4">
                        {switchCount > 0 ? (
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full font-extrabold text-xs inline-flex items-center gap-1 border border-red-200">
                            ⚠ {switchCount} warning{switchCount > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">None</span>
                        )}
                      </td>
                      <td className="py-4 text-slate-500">
                        {new Date(attempt.submittedAt).toLocaleDateString('en-US', {
                             month: 'short',
                             day: '2-digit',
                             year: 'numeric'
                          })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {quiz.attempts.length === 0 && (
              <p className="text-center py-10 text-slate-400">No submissions yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Quiz Info */}
        <Card>
          <CardHeader>
            <CardTitle>Test Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Title</p>
              <p className="font-semibold">{quiz.title}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Description</p>
              <p className="text-sm">{quiz.description || "No description provided."}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}