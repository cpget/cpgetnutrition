"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Video, ClipboardCheck, MessageCircle, Trophy } from "lucide-react";
import { Session } from "next-auth";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { WavyBackground } from "@/components/ui/wavy-background";
import { useTheme } from "next-themes";

interface LandingProps {
  session: Session | null;
}

export default function Landing({ session }: LandingProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const userRole = session?.user?.role;
  const dashboardHref = userRole === "TEACHER" ? "/dashboard/teacher" : "/classroom";

  if (!mounted) return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
      <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isDark = resolvedTheme === "dark";

  const achievements = [
    {
      year: "2025", students: [
        { name: "Sana Fatima", rank: "State 1st Rank", color: "from-yellow-400 to-orange-500" },
        { name: "R. Sravani", rank: "State 2nd Rank", color: "from-slate-300 to-slate-400" },
        { name: "Ameera Tabassum", rank: "State 3rd Rank", color: "from-orange-400 to-orange-700" },
        { name: "Maherunnisa", rank: "State 5th Rank", color: "from-blue-400 to-blue-600" },
      ]
    },
    {
      year: "2024", students: [
        { name: "Hameera Neha", rank: "State 2nd Rank", color: "from-blue-400 to-indigo-500" },
        { name: "Hiba Khan", rank: "4th Rank", color: "from-blue-400 to-indigo-500" },
        { name: "Vishakha Singh", rank: "11th Rank", color: "from-blue-400 to-indigo-500" },
        { name: "Sadiya", rank: "15th Rank", color: "from-blue-400 to-indigo-500" },
      ]
    },
    {
      year: "2023", students: [
        { name: "Sana Shereen", rank: "State 1st Rank", color: "from-yellow-400 to-orange-500" },
        { name: "Zeba Fatima", rank: "9th Rank", color: "from-blue-400 to-indigo-500" },
      ]
    }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500">

      {/* HERO SECTION */}
      <WavyBackground
        className="max-w-6xl mx-auto pt-24 pb-20"
        backgroundFill={isDark ? "#020617" : "#ffffff"}
        colors={isDark ? ["#38bdf8", "#818cf8", "#c084fc"] : ["#60a5fa", "#3b82f6", "#2563eb"]}
        waveOpacity={isDark ? 0.3 : 0.15}
      >
        <div className="flex flex-col items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400 backdrop-blur-xl mb-8 uppercase tracking-[0.2em]"
          >
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>Legacy of Excellence in Nutrition</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-9xl font-black text-slate-900 dark:text-white text-center tracking-tighter leading-[0.85] mb-8"
          >
            Crack <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-cyan-300">CPGET & NCET</span> <br />
            with Ease.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium text-center max-w-2xl leading-relaxed mb-12"
          >
            The #1 coaching portal for Nutrition & Dietetics. Join the platform that consistently produces State Toppers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            {session ? (
              <HoverBorderGradient containerClassName="rounded-full" className="bg-white dark:bg-black text-black dark:text-white flex items-center space-x-2 px-10 py-4 text-lg font-bold">
                <Link href={dashboardHref} className="flex items-center gap-2">
                  <span>Open {userRole === "TEACHER" ? "Teacher Panel" : "Classroom"}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </HoverBorderGradient>
            ) : (
              <Link href="/auth/signup">
                <button className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg font-bold transition-all shadow-xl shadow-blue-500/25 flex items-center gap-2 cursor-pointer">
                  Join the Next Batch <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
            )}
          </motion.div>
        </div>
      </WavyBackground>

      {/* ACHIEVEMENTS / HALL OF FAME */}
      <section className="py-24 relative z-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Our Achivements in Previous Years</h2>
          <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full" />
        </div>

        <div className="space-y-24"> {/* Increased spacing between years */}
          {achievements.map((yearGroup, idx) => (
            <div key={idx} className="relative">
              {/* IMPROVED YEAR MARKER: Darker and more visible */}
              <div className="absolute -left-4 -top-8 text-8xl md:text-[10rem] font-black text-slate-200 dark:text-slate-800/40 select-none pointer-events-none">
                {yearGroup.year}
              </div>

              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
                {yearGroup.students.map((student, sIdx) => (
                  <motion.div
                    key={sIdx}
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="relative p-6 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 overflow-hidden group backdrop-blur-sm"
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${student.color} opacity-10 blur-2xl group-hover:opacity-30 transition-opacity`} />
                    <Trophy className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-4" />
                    <h4 className="text-xl font-black text-slate-900 dark:text-white">{student.name}</h4>
                    <p className={`text-transparent bg-clip-text bg-gradient-to-r ${student.color} font-bold uppercase tracking-widest text-sm mt-1`}>
                      {student.rank}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="relative z-20 max-w-7xl mx-auto px-6 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">We Provide</h2>
          <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Live Classes", desc: "One-click access to Google Meet lectures.", icon: <Video /> },
            { title: "Smart Tests", desc: "Real-time CPGET pattern mock exams.", icon: <ClipboardCheck /> },
            { title: "Doubt Solving", desc: "Direct sync between teacher and student.", icon: <MessageCircle /> },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 backdrop-blur-md transition-all hover:border-blue-500/50 hover:shadow-2xl shadow-sm"
            >
              <div className="h-14 w-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-8 ring-1 ring-blue-600/20">
                {React.cloneElement(item.icon as React.ReactElement<{ size: number }>, { size: 28 })}
              </div>
              <h3 className="text-slate-900 dark:text-white font-black text-xl mb-3">{item.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}