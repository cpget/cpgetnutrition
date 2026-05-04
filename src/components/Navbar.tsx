"use client"

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

import { 
  Navbar as AceternityNavbar, 
  NavBody, 
  MobileNav, 
  MobileNavHeader, 
  MobileNavToggle, 
  MobileNavMenu 
} from "@/components/ui/resizable-navbar";
import AuthDialog from "@/components/AuthDialog";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthed = !!session?.user;
  const dashboardHref = session?.user?.role === "TEACHER" ? "/dashboard/teacher" : "/classroom";

  return (
    <AceternityNavbar className="top-0 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      {/* --- DESKTOP VIEW --- */}
      <NavBody className="hidden md:flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0 relative z-50">
          <div className="relative h-7 w-7 overflow-hidden rounded-md border shadow-sm">
            <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            CPGET <span className="text-blue-600">NUTRITION</span>
          </span>
        </Link>

        {/* Desktop Actions */}
        <div className="flex items-center gap-4 relative z-50">
          {/* Toggle Moved Beside Auth Buttons */}
          <ThemeToggle />
          
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />

          {status === "loading" ? (
            <div className="h-8 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
          ) : isAuthed ? (
            <div className="flex items-center gap-6">
              <Link 
                href={dashboardHref} 
                className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <div className="flex items-center gap-4 border-l pl-4 border-slate-200 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {session?.user?.name?.split(' ')[0]}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-red-600 h-auto p-0 font-bold uppercase text-[10px]"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                  Exit
                </Button>
              </div>
            </div>
          ) : (
            <AuthDialog />
          )}
        </div>
      </NavBody>

      {/* --- MOBILE VIEW --- */}
      <MobileNav className="md:hidden">
        <MobileNavHeader className="px-4 py-2 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-6 w-6 overflow-hidden rounded-md border shadow-sm">
              <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
            </div>
            <span className="text-sm font-bold tracking-tight dark:text-white">CPGET</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNavToggle 
              isOpen={isMobileMenuOpen} 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            />
          </div>
        </MobileNavHeader>

        <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
          <div className="flex flex-col gap-4 w-full p-4">
            {isAuthed ? (
              <>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-blue-600 uppercase mb-1">{session?.user?.role}</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{session?.user?.name}</p>
                </div>
                <Button asChild className="w-full bg-blue-600 h-12 rounded-xl text-white">
                  <Link href={dashboardHref} onClick={() => setIsMobileMenuOpen(false)}>Go to Dashboard</Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-xl text-red-600 border-red-100 dark:border-red-900/30"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                 <p className="text-sm text-slate-500 dark:text-slate-400 font-medium px-2 mb-2 text-center">Join the Nutrition Portal</p>
                 <AuthDialog />
              </div>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </AceternityNavbar>
  );
}