import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, HelpCircle, UserCheck, BookOpen, Video, Megaphone } from "lucide-react"
import AnnouncementDialog from "./AnnouncementDialog"
import { StatCard } from "./StatCard"

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "TEACHER") {
    redirect("/")
  }

  const [announcement, totalStudents, pendingUsers, pendingDoubts] = await Promise.all([
    prisma.announcement.findUnique({ where: { id: "GLOBAL" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.findMany({ where: { role: "STUDENT", isApproved: false } }),
    prisma.doubt.count({ where: { answer: null } }),
  ])
  
  const pendingCount = pendingUsers.length;
  console.log("Pending Users:", pendingUsers);

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
        <StatCard 
          title="Active Community" 
          value={totalStudents} 
          icon={<Users size={20} />} 
          color="blue"
          trend="+12% this week"
        />
        <StatCard 
          title="Review Required" 
          value={pendingCount} 
          icon={<UserCheck size={20} />} 
          color="orange"
          description={pendingCount > 0 ? "Action required for new students" : "All students approved"}
        />
        <StatCard 
          title="Pending Doubts" 
          value={pendingDoubts} 
          icon={<HelpCircle size={20} />} 
          color="purple"
          description="Awaiting your expert guidance"
        />
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
        {/* BROADCAST SPOTLIGHT - Updated (No Title) */}
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

        {/* The Description is now the main focus */}
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
    /* No Announcement State remains the same... */
    <div className="group relative p-8 h-[340px] rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center gap-3">
       {/* ... existing silent mode code ... */}
    </div>
  )}
</div>
      </div>

      {/* 4. PENDING USERS SECTION */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold dark:text-white">Pending Approvals</h2>
          <Badge variant="outline" className="text-[10px] uppercase border-orange-500/50 text-orange-500 bg-orange-500/5">
            {pendingCount} Pending
          </Badge>
        </div>
        
        {pendingCount === 0 ? (
          <div className="p-8 rounded-[2rem] border border-dashed border-slate-200 dark:border-white/10 text-center text-slate-500">
            No pending users
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingUsers.map(user => (
              <div key={user.id} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 flex flex-col gap-2">
                <span className="font-semibold text-slate-900 dark:text-white">{user.name}</span>
                <span className="text-sm text-slate-500">{user.email}</span>
                <Link href="/dashboard/teacher/students" className="mt-2 text-sm text-blue-600 hover:underline">
                  Review in Student Management &rarr;
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}