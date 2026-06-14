import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCurrentMockLeaderboard } from "@/lib/leaderboard"
import { 
  HelpCircle, 
  PenTool, 
  BookOpen, 
  Bell, 
  ArrowRight,
  LayoutDashboard,
  GraduationCap,
  Trophy,
  Medal,
  Star
} from "lucide-react"

export default async function ClassroomHome() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "STUDENT") {
    redirect("/")
  }

  const [announcement, leaderboard] = await Promise.all([
    prisma.announcement.findUnique({ where: { id: "GLOBAL" } }),
    getCurrentMockLeaderboard(session.user.id)
  ])

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10 px-4">
      
      {/* 1. Professional Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-medium tracking-wide uppercase text-sm">
              <GraduationCap className="h-5 w-5" />
              Student Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Welcome, {session.user.name?.split(' ')[0]}
            </h1>
            <p className="text-slate-400 text-lg max-w-md">
              Access your CPGET Nutrition curriculum and academic records.
            </p>
          </div>
          <div className="hidden md:block">
            <LayoutDashboard className="h-24 w-24 text-slate-800" />
          </div>
        </div>
      </div>

      {/* 2. Announcements (Priority Placement) */}
      {announcement && (
        <div className="group relative rounded-2xl border-l-4 border-l-indigo-600 border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-indigo-50 p-3 text-indigo-600">
              <Bell className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Latest Update</span>
                <span className="text-slate-300">•</span>
                <h3 className="font-bold text-slate-900 text-lg">{announcement.title}</h3>
              </div>
              <p className="text-slate-600 leading-relaxed">{announcement.content}</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Academic Resources Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="font-bold text-slate-900 text-xl tracking-tight">Academic Resources</h3>
          <p className="text-sm text-slate-500">Select a module to continue</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickLink 
            href="/classroom/live" 
            title="Live Sessions" 
            desc="Join interactive lectures" 
            icon={<Bell className="h-6 w-6" />} // Re-using Bell or Video for live
            color="text-red-600"
            bg="bg-red-50"
          />

          <QuickLink 
            href="/classroom/doubts" 
            title="Doubts " 
            desc="Query resolution portal" 
            icon={<HelpCircle className="h-6 w-6" />}
            color="text-blue-600"
            bg="bg-blue-50"
          />

          <QuickLink 
            href="/classroom/quizzes" 
            title="Mock Tests" 
            desc="Practice and mock exams" 
            icon={<PenTool className="h-6 w-6" />}
            color="text-purple-600"
            bg="bg-purple-50"
          />
        </div>
      </div>

      {/* 4. Weekly Leaderboard Section */}
      <div className="space-y-6 pt-6">
        <div className="border-b border-slate-200 pb-4">
          <h3 className="font-bold text-slate-900 text-xl tracking-tight">Weekly Mock Test Leaderboard</h3>
          <p className="text-sm text-slate-500">Track Top 5 performers in this week's active Mock Test</p>
        </div>

        {!leaderboard.quiz ? (
          <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <Trophy className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-sm text-slate-500 font-semibold">
              No active mock test leaderboard available.
            </p>
          </div>
        ) : leaderboard.totalParticipants === 0 ? (
          <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
              <CardTitle className="text-lg font-bold text-slate-950">
                Weekly Leaderboard: <span className="text-blue-600">{leaderboard.quiz.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-12 text-center">
              <Trophy className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm text-slate-500 font-semibold">
                Leaderboard will appear once students complete the mock test.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top 5 list (takes 2 columns) */}
            <Card className="lg:col-span-2 border border-slate-200 rounded-3xl overflow-hidden shadow-md bg-white">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-950">
                    Weekly Leaderboard: <span className="text-blue-600">{leaderboard.quiz.title}</span>
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-1">Showing top performers for this week's active mock test</p>
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold shrink-0">
                  {leaderboard.totalParticipants} Participants
                </Badge>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {leaderboard.topFive.map((entry) => {
                    const isCurrentUser = entry.studentId === session.user.id;
                    
                    return (
                      <div 
                        key={entry.studentId}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                          isCurrentUser 
                            ? "bg-blue-50/80 border-blue-400 shadow-sm" 
                            : "bg-white border-slate-100 hover:border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank indicator */}
                          <div className="flex items-center justify-center w-8 h-8 rounded-full font-black text-sm">
                            {entry.rank === 1 ? (
                              <Trophy className="h-6 w-6 text-amber-500" />
                            ) : entry.rank === 2 ? (
                              <Medal className="h-6 w-6 text-slate-400" />
                            ) : entry.rank === 3 ? (
                              <Medal className="h-6 w-6 text-amber-700" />
                            ) : (
                              <span className="text-slate-400 font-bold">#{entry.rank}</span>
                            )}
                          </div>
                          
                          {/* Student name */}
                          <div>
                            <p className="font-bold text-slate-900 flex items-center gap-2">
                              {entry.name}
                              {isCurrentUser && (
                                <Badge variant="outline" className="bg-blue-600 text-white border-none text-[9px] uppercase py-0.5 px-1.5 font-extrabold tracking-wider">
                                  You
                                </Badge>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                              {entry.rank === 1 ? "Gold Medalist" : entry.rank === 2 ? "Silver Medalist" : entry.rank === 3 ? "Bronze Medalist" : "Top Contender"}
                            </p>
                          </div>
                        </div>

                        {/* Exact score details only for logged-in student */}
                        {isCurrentUser ? (
                          <div className="text-right">
                            <p className="font-extrabold text-blue-600 text-lg">
                              {entry.score}/{leaderboard.quiz?.totalQuestions}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{entry.percentage}% score</p>
                          </div>
                        ) : (
                          <div className="text-right">
                            {/* Privacy compliance: other scores locked */}
                            <Badge variant="outline" className="border-slate-200 text-slate-400 bg-slate-50 font-semibold text-[10px]">
                              Locked (Score Hidden)
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {leaderboard.currentStudentRank && leaderboard.currentStudentRank <= 5 && (
                  <div className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-bold flex items-center gap-2">
                    <Trophy className="h-5 w-5 shrink-0" />
                    <span>You are currently ranked #{leaderboard.currentStudentRank} in this week's mock test. Keep it up!</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current student performance summary (takes 1 column) */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-md bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white relative">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-[80px] pointer-events-none" />
                <CardHeader className="p-6 border-b border-white/5">
                  <CardTitle className="text-base font-bold tracking-tight uppercase text-blue-400 flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-400" />
                    Your Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {leaderboard.currentStudentRank ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-slate-300 font-medium">Your Rank</span>
                        <span className="text-2xl font-black text-blue-400">#{leaderboard.currentStudentRank}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-slate-300 font-medium">Your Score</span>
                        <span className="text-xl font-bold">{leaderboard.currentStudentScore}/{leaderboard.quiz?.totalQuestions}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-slate-300 font-medium">Percentage</span>
                        <span className="text-xl font-bold">
                          {Math.round(((leaderboard.currentStudentScore || 0) / (leaderboard.quiz?.totalQuestions || 1)) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-300 font-medium">Participants</span>
                        <span className="text-lg font-bold">{leaderboard.totalParticipants}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-slate-300 font-medium">
                        You haven't attempted this week's mock test yet.
                      </p>
                      <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold" asChild>
                        <Link href={`/classroom/quizzes`}>
                          Take Mock Test &rarr;
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Rules & Info Card */}
              <Card className="border border-slate-200 rounded-3xl overflow-hidden shadow-md bg-white">
                <CardHeader className="p-6 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-slate-900">
                    Leaderboard Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-xs text-slate-500 space-y-3 leading-relaxed">
                  <p>🥇 <strong>Rankings Update</strong>: Calculated dynamically and resets every week when a new Mock Test is activated by the faculty.</p>
                  <p>🕒 <strong>Tie-Breaker</strong>: If scores are identical, the student with the earlier completion timestamp is ranked higher.</p>
                  <p>🔒 <strong>Score Privacy</strong>: Exact scores of other students are kept locked to protect individual results while fostering healthy batch competition.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function QuickLink({ href, title, desc, icon, color, bg }: any) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-slate-200 overflow-hidden">
        <CardContent className="p-6 flex flex-col h-full">
          <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
            {icon}
          </div>
          <div className="space-y-2 flex-1">
            <h4 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
              {title}
            </h4>
            <p className="text-sm text-slate-500 leading-snug">{desc}</p>
          </div>
          <div className="pt-4 mt-auto">
            <div className="flex items-center text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
              Open Module <ArrowRight className="ml-2 h-3 w-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}