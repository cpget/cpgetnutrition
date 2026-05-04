"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles, Video, ClipboardCheck, FileText, MessageCircle } from "lucide-react"
import { Session } from "next-auth"
import { Button } from "@/components/ui/button"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import { WavyBackground } from "@/components/ui/wavy-background"
import { useTheme } from "next-themes"

interface LandingProps {
  session: Session | null
}

export default function Landing({ session }: LandingProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const userRole = session?.user?.role;
  const dashboardHref = userRole === "TEACHER" ? "/dashboard/teacher" : "/classroom";

  // Better Hydration Handling: Show a themed skeleton instead of null
  if (!mounted) return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
      <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500">
      
      {/* HERO SECTION */}
      <WavyBackground 
        className="max-w-5xl mx-auto pt-24 pb-36"
        backgroundFill={isDark ? "#020617" : "#ffffff"} 
        colors={isDark ? ["#38bdf8", "#818cf8", "#c084fc"] : ["#60a5fa", "#3b82f6", "#2563eb"]}
        waveOpacity={isDark ? 0.4 : 0.2}
      >
        <div className="flex flex-col items-center justify-center px-4">
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-100 dark:border-white/10 bg-blue-50/50 dark:bg-white/5 px-4 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 backdrop-blur-xl mb-6 uppercase tracking-widest"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Official CPGET Nutrition Portal</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white text-center tracking-tighter leading-[0.9]"
          >
            Crack <span className="text-blue-600 dark:text-blue-500">CPGET</span> <br /> 
            with Confidence.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-slate-600 dark:text-slate-300 font-medium text-center mt-8 max-w-xl leading-relaxed"
          >
            Attend live classes, take mock tests, and track your rank — all in one 
            specialized platform designed for Nutrition & Dietetics students.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-12 flex flex-col sm:flex-row items-center gap-4"
          >
            {session ? (
              <HoverBorderGradient containerClassName="rounded-full" className="bg-white dark:bg-black text-black dark:text-white flex items-center space-x-2 px-10 py-4 text-lg font-bold">
                <Link href={dashboardHref} className="flex items-center gap-2">
                  <span>Open {userRole === "TEACHER" ? "Teacher Panel" : "Classroom"}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </HoverBorderGradient>
            ) : (
              <>
                <Button asChild size="lg" className="h-14 px-10 rounded-full text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-[0_10px_20px_rgba(37,99,235,0.2)] transition-all hover:-translate-y-1">
                  <Link href="/login">Get Started Free</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-full text-lg font-bold border-slate-200 dark:border-white/10 backdrop-blur-md bg-transparent hover:bg-slate-50 dark:hover:bg-white/5">
                  <Link href="#features">Learn More</Link>
                </Button>
              </>
            )}
          </motion.div>
        </div>
      </WavyBackground>

      {/* TRUST / PROOF SECTION */}
      <section className="relative z-20 max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Practice Questions", value: "500+" },
            { label: "Weekly Classes", value: "Live" },
            { label: "Expert Faculty", value: "1:1" },
            { label: "Portal Access", value: "24/7" },
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <h3 className="text-4xl font-black text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-transform duration-300">{stat.value}</h3>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="relative z-20 max-w-6xl mx-auto px-4 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: "Live Classes", desc: "One-click access to Google Meet lectures.", icon: <Video /> },
            { title: "Smart Tests", desc: "Real-time CPGET pattern mock exams.", icon: <ClipboardCheck /> },
            { title: "Assignments", desc: "Seamless submission and grading system.", icon: <FileText /> },
            { title: "Doubt Solving", desc: "Direct sync between teacher and student.", icon: <MessageCircle /> },
          ].map((item, i) => (
            <motion.div
              key={i} whileHover={{ y: -10 }}
              className="p-8 rounded-[2.5rem] bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10"
            >
              <div className="h-12 w-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
               {React.cloneElement(item.icon as React.ReactElement<{ size: number }>, { size: 24 })}
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}