import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users, HelpCircle, UserCheck, BookOpen, Video, Megaphone } from "lucide-react"
import AnnouncementDialog from "./AnnouncementDialog"
import { StatCard } from "./StatCard"
import { getCurrentMockLeaderboard } from "@/lib/leaderboard"
import TeacherActivateButton from "./TeacherActivateButton"

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "TEACHER") {
    redirect("/")
  }

  const [announcement, totalStudents, pendingUsers, pendingDoubts, quizzes, leaderboard] = await Promise.all([
    prisma.announcement.findUnique({ where: { id: "GLOBAL" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.findMany({ where: { role: "STUDENT", isApproved: false } }),
    prisma.doubt.count({ where: { answer: null } }),
    prisma.quiz.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        isActive: true,
        _count: {
          select: { questions: true }
        }
      }
    }),
    getCurrentMockLeaderboard()
  ])

  const pendingCount = pendingUsers.length;
  console.log("Pending Users:", pendingUsers);

  const currentActiveQuiz = leaderboard.quiz ? {
    id: leaderboard.quiz.id,
    title: leaderboard.quiz.title,
    participantsCount: leaderboard.totalParticipants,
  } : null;

  return (
    <div className="space-y-10 pb-20">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome, <span className="text-blue-600">{session.user.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-[0.2em]">
            Overview • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Live Academy Status</span>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Link href="/dashboard/teacher/students">
          <div className="cursor-pointer transition-transform hover:scale-[1.02]">
            <StatCard
              title="Active Community"
              value={totalStudents}
              icon={<Users size={20} />}
              color="blue"
              trend="+12% this week"
            />
          </div>
        </Link>

        <Link href="/dashboard/teacher/students">
          <div className="cursor-pointer transition-transform hover:scale-[1.02]">
            <StatCard
              title="Review Required"
              value={pendingCount}
              icon={<UserCheck size={20} />}
              color="orange"
              description={
                pendingCount > 0
                  ? "Action required for new students"
                  : "All students approved"
              }
            />
          </div>
        </Link>

        <Link href="/dashboard/teacher/doubts">
          <div className="cursor-pointer transition-transform hover:scale-[1.02]">
            <StatCard
              title="Pending Doubts"
              value={pendingDoubts}
              icon={<HelpCircle size={20} />}
              color="purple"
              description="Awaiting your expert guidance"
            />
          </div>
        </Link>

      </div>

      {/* 3. MAIN BENTO GRID */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* QUICK ACTIONS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold dark:text-white">Quick Actions</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-white/10 to-transparent ml-4" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-32 flex-col gap-3 rounded-[2rem] border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-500/10 group transition-all duration-300" asChild>
              <Link href="/dashboard/teacher/quizzes">
                <BookOpen className="h-6 w-6 text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Setup Mock Test</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-32 flex-col gap-3 rounded-[2rem] border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 group transition-all duration-300" asChild>
              <Link href="/dashboard/teacher/live">
                <Video className="h-6 w-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Start Live Class</span>
              </Link>
            </Button>
            <div className="group transition-all">
              <AnnouncementDialog />
            </div>
          </div>
        </div>

        {/* BROADCAST SPOTLIGHT (ENHANCED) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold dark:text-white">Broadcast</h2>
              <Badge variant="outline" className="text-[10px] uppercase border-blue-500/50 text-blue-500 bg-blue-500/5">
                Live Feed
              </Badge>
            </div>
          </div>

          {announcement ? (
            <div className="relative group overflow-hidden rounded-[2rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 p-1 transition-all hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative rounded-[1.9rem] bg-white dark:bg-slate-900 p-8 backdrop-blur-3xl">
                <div className="flex justify-between items-center mb-6">
                  <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                    <Megaphone size={20} className="text-white animate-pulse" />
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1 justify-end">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                      Active
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                      {new Date(announcement.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="text-lg font-semibold text-slate-900 dark:text-white leading-relaxed mb-8">
                  "{announcement.content}"
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-7 w-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800" />
                    ))}
                    <div className="h-7 px-3 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600 text-[9px] flex items-center justify-center text-white font-bold">
                      +{totalStudents} Students reached
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="group relative p-8 h-[340px] rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center gap-3 bg-white dark:bg-slate-900/50">
              <p className="text-sm text-slate-500">No active broadcasts</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. LEADERBOARD & CONTROLS / PENDING GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
        {/* LEADERBOARD (takes 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold dark:text-white">Weekly Mock Test Leaderboard</h2>
          </div>

          <Card className="border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-md bg-white dark:bg-slate-900">
            <CardHeader className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 p-6 flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold dark:text-white">
                  Active Mock Test: {leaderboard.quiz ? (
                    <span className="text-blue-600 dark:text-blue-400">{leaderboard.quiz.title}</span>
                  ) : (
                    <span className="text-red-500 font-semibold">No mock test has been activated.</span>
                  )}
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">Full score details visible to faculty only</p>
              </div>
              {leaderboard.quiz && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold shrink-0">
                  {leaderboard.totalParticipants} Participants
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-6">
              {!leaderboard.quiz ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/5">
                  <p className="text-sm text-slate-500 font-semibold">
                    No mock test has been activated.
                  </p>
                </div>
              ) : leaderboard.totalParticipants === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/5">
                  <p className="text-sm text-slate-500 font-semibold">
                    Leaderboard will appear once students complete the mock test.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-white/5 dark:text-slate-400">
                      <tr>
                        <th scope="col" className="px-4 py-3">Rank</th>
                        <th scope="col" className="px-4 py-3">Student Name</th>
                        <th scope="col" className="px-4 py-3">Email</th>
                        <th scope="col" className="px-4 py-3">Score</th>
                        <th scope="col" className="px-4 py-3">Percentage</th>
                        <th scope="col" className="px-4 py-3">Percentile</th>
                        <th scope="col" className="px-4 py-3">Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.topFive.map((entry) => (
                        <tr key={entry.studentId} className="bg-white border-b dark:bg-slate-900 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-950 dark:text-white">
                          <td className="px-4 py-3 font-bold">#{entry.rank}</td>
                          <td className="px-4 py-3 font-semibold">{entry.name}</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{entry.email}</td>
                          <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400">{entry.score}/{leaderboard.quiz?.totalQuestions}</td>
                          <td className="px-4 py-3 font-bold">{entry.percentage}%</td>
                          <td className="px-4 py-3 font-semibold text-teal-600 dark:text-teal-400">Top {entry.topPercentage}%</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{new Date(entry.submittedAt).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* SIDE BAR FOR CONTROLS & PENDING USERS (takes 1 column) */}
        <div className="space-y-6">
          {/* Quick Activation Status */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold dark:text-white">Weekly Mock Test Status</h2>
            <Card className="border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-md">
              <CardHeader className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                <CardTitle className="text-sm font-bold dark:text-white">
                  Quick Activate Test
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {quizzes.length === 0 ? (
                  <p className="text-xs text-slate-500">No mock tests available. Create one to get started.</p>
                ) : (
                  <div className="space-y-3">
                    {quizzes.map((quiz) => (
                      <div key={quiz.id} className="flex items-center justify-between text-xs p-3 rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900">
                        <span className="font-semibold truncate max-w-[130px] dark:text-white">{quiz.title}</span>
                        {quiz.isActive ? (
                          <Badge className="bg-emerald-500 text-white border-none py-0.5 px-2 font-bold uppercase text-[9px] shrink-0">
                            Active
                          </Badge>
                        ) : (
                          <div className="shrink-0">
                            <TeacherActivateButton
                              quizId={quiz.id}
                              title={quiz.title}
                              isActive={quiz.isActive}
                              questionsCount={quiz._count.questions}
                              currentActiveQuiz={currentActiveQuiz}
                              variant="sidebar"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pending Approvals */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold dark:text-white">Pending Approvals</h2>
            <Card className="border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-md">
              <CardHeader className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold dark:text-white">
                  Student Verification
                </CardTitle>
                <Badge variant="outline" className="text-[10px] uppercase border-orange-500/50 text-orange-500 bg-orange-500/5 shrink-0">
                  {pendingCount} Pending
                </Badge>
              </CardHeader>
              <CardContent className="p-6">
                {pendingCount === 0 ? (
                  <div className="text-center text-xs text-slate-500">
                    No pending students
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingUsers.map(user => (
                      <div key={user.id} className="p-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 flex flex-col gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{user.name}</span>
                        <span className="text-[10px] text-slate-500">{user.email}</span>
                        <Link href="/dashboard/teacher/students" className="text-[10px] text-blue-600 hover:underline font-bold mt-1">
                          Review in Student Management &rarr;
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </div>
  )
}