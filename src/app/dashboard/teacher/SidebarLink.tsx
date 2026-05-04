"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function SidebarLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== "/dashboard/teacher" && pathname.startsWith(href))

  return (
    <Link 
      href={href} 
      className={cn(
        "relative flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors duration-200 group",
        isActive 
          ? "text-blue-600 dark:text-blue-400" 
          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
      )}
    >
      {/* Animated Background Indicator */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 bg-blue-50 dark:bg-blue-500/10 rounded-xl -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      
      <span className={cn(
        "transition-transform duration-200 group-hover:scale-110",
        isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"
      )}>
        {icon}
      </span>
      
      <span className="text-sm tracking-tight">{label}</span>
      
      {/* Active Dot */}
      {isActive && (
        <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shadow-[0_0_8px_#2563eb]" />
      )}
    </Link>
  )
}