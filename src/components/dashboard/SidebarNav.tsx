"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils" // Shadcn helper for classes

const links = [
  { name: "Overview", href: "/dashboard/teacher" },
  { name: "Assignments", href: "/dashboard/teacher/assignments" },
  { name: "Quizzes", href: "/dashboard/teacher/quizzes" },
  { name: "Live Classes", href: "/dashboard/teacher/live-classes" },
  { name: "Doubts", href: "/dashboard/teacher/doubts" },
  { name: "Students", href: "/dashboard/teacher/students" },
]

export default function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col space-y-1">
      {links.map((link) => {
        const isActive = pathname === link.href

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-all",
              isActive 
                ? "bg-blue-50 text-blue-600 shadow-sm border-r-4 border-blue-600" 
                : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
            )}
          >
            {link.name}
          </Link>
        )
      })}
    </nav>
  )
}