"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  trend?: string;
  color: "blue" | "orange" | "emerald" | "purple";
}

const colorMap = {
  blue: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
  orange: "text-orange-600 bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20",
  emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20",
  purple: "text-purple-600 bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20",
}

export function StatCard({ title, value, icon, description, trend, color }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="relative overflow-hidden border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2.5 rounded-xl border", colorMap[color])}>
            {icon}
          </div>
          {trend && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {trend}
            </span>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </h3>
          {description && (
            <p className="text-xs text-slate-400 mt-2">{description}</p>
          )}
        </div>

        {/* Subtle Background Glow */}
        <div className={cn(
          "absolute -right-4 -bottom-4 h-24 w-24 blur-3xl opacity-10 dark:opacity-20 rounded-full",
          color === "blue" ? "bg-blue-500" : color === "orange" ? "bg-orange-500" : "bg-emerald-500"
        )} />
      </Card>
    </motion.div>
  )
}