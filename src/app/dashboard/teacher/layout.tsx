import { SidebarLink } from "./SidebarLink"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, BookOpen, FileText, 
  Video, MessageSquare, Users, ChevronLeft 
} from "lucide-react"
import Link from "next/link"

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500 overflow-x-hidden">
      
      {/* SIDEBAR - Fixed but with higher Z-index */}
      <aside className="fixed left-0 top-0 hidden h-full w-72 flex-col border-r border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl lg:flex z-[100]">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:rotate-12 transition-transform">
              <span className="text-white font-black text-lg italic">N</span>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tighter text-slate-900 dark:text-white leading-none">
                CPGET <span className="text-blue-600">ACADEMY</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Faculty Control</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Main Menu</p>
          <SidebarLink href="/dashboard/teacher" icon={<LayoutDashboard size={20} />} label="Overview" />
          <SidebarLink href="/dashboard/teacher/students" icon={<Users size={20} />} label="Students" />
          <SidebarLink href="/dashboard/teacher/doubts" icon={<MessageSquare size={20} />} label="Doubts" />
          
          <div className="pt-4" />
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Academic</p>
          <SidebarLink href="/dashboard/teacher/assignments" icon={<FileText size={20} />} label="Assignments" />
          <SidebarLink href="/dashboard/teacher/quizzes" icon={<BookOpen size={20} />} label="Mock Tests" />
          <SidebarLink href="/dashboard/teacher/live" icon={<Video size={20} />} label="Live Classes" />
        </nav>

        <div className="p-6 mt-auto border-t border-slate-100 dark:border-white/5">
          <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl" asChild>
            <Link href="/">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Exit to Portal
            </Link>
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      {/* We use lg:pl-72 to make space for the fixed sidebar */}
      <main className="flex-1 lg:pl-72 flex flex-col min-h-screen relative">
        <div className="absolute top-0 right-0 h-64 w-64 bg-blue-600/5 blur-[120px] pointer-events-none" />
        
        {/* Content Container */}
        <div className="p-6 md:p-10 flex-grow">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>

        {/* Optional: Dashboard-only Mini Footer */}
        <div className="px-10 py-6 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-400 uppercase tracking-widest">
           CPGET Management System v1.0 • {new Date().getFullYear()}
        </div>
      </main>

    </div>
  )
}