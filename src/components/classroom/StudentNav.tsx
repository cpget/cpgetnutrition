"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet"
import { useSession, signOut } from "next-auth/react"
import AuthButton from "../auth/AuthButton"
// 1. Import the Menu icon
import { Menu, LogOut, User } from "lucide-react"

const links = [
  { href: "/classroom", label: "Home" },
  { href: "/classroom/live", label: "Live Classes" },
  { href: "/classroom/quizzes", label: "Quizzes" },
  { href: "/classroom/assignments", label: "Assignments" },
  { href: "/classroom/doubts", label: "Doubts" },
]

export default function StudentNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/classroom" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-blue-400 ">
      CPGET
    </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {links.map((l) => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                )}
              >
                {l.label}
              </Link>
            )
          })}

          <div className="ml-2 pl-2 border-l border-slate-200">
            {session ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Link href="/login">
                <Button size="sm">Login</Button>
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile nav */}
        <div className="md:hidden">
          <Sheet>
            {/* 2. Hamburger Button Trigger */}
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-600">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[300px] sm:w-[350px]">
              <SheetHeader className="pb-6 border-b">
                <SheetTitle className="flex items-center gap-2">
                   <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center text-white text-[10px]">CP</div>
                   Classroom Menu
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-4 mt-6">
                {session && (
                  <div className="px-3 py-4 rounded-xl bg-slate-50 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-none">{session.user?.name}</p>
                      <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{session.user?.role}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  {links.map((l) => {
                    const active = pathname === l.href
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        className={cn(
                          "flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all",
                          active
                            ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {l.label}
                      </Link>
                    )
                  })}
                </div>

                <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                  {session ? (
                    <Button
                      variant="destructive"
                      className="w-full justify-start gap-2"
                      onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  ) : (
                    <Link href="/login" className="w-full">
                      <Button className="w-full">Login</Button>
                    </Link>
                  )}
                  
                  {/* Keep your custom auth button if needed */}
                  {!session && <AuthButton />}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  )
}