"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function TeacherActivateButton({ quizId }: { quizId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleActivate = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/teacher/quizzes/${quizId}/activate`, { method: "POST" })
      if (res.ok) {
        router.refresh()
      } else {
        alert("Failed to activate mock test")
      }
    } catch (error) {
      console.error(error)
      alert("Error activating mock test")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="text-xs h-7 py-0 font-semibold border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
      onClick={handleActivate}
      disabled={loading}
    >
      {loading ? "Activating..." : "Activate"}
    </Button>
  )
}
