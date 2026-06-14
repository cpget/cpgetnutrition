import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  HelpCircle, 
  PenTool, 
  BookOpen, 
  Bell, 
  ArrowRight,
  LayoutDashboard,
  GraduationCap
} from "lucide-react"

export default async function ClassroomHome() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "STUDENT") {
    redirect("/")
  }

  const announcement = await prisma.announcement.findUnique({ 
    where: { id: "GLOBAL" } 
  })

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