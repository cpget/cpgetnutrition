"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CurrentActiveQuizInfo {
  id: string
  title: string
  participantsCount: number
}

interface TeacherActivateButtonProps {
  quizId: string
  title: string
  isActive: boolean
  questionsCount: number
  currentActiveQuiz: CurrentActiveQuizInfo | null
  variant?: "card" | "sidebar"
}

export default function TeacherActivateButton({
  quizId,
  title,
  isActive,
  questionsCount,
  currentActiveQuiz,
  variant = "sidebar"
}: TeacherActivateButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleActivateClick = () => {
    // Prevent empty quiz activation
    if (questionsCount === 0) {
      toast.error(
        "This mock test contains no questions. Please add questions before activating it.",
        { duration: 5000 }
      )
      return
    }

    // Check if another active quiz exists
    if (currentActiveQuiz && currentActiveQuiz.id !== quizId) {
      setConfirmOpen(true)
      return
    }

    // Direct activation if no other quiz is active
    performActivation()
  }

  const performActivation = async () => {
    setLoading(true)
    setConfirmOpen(false)
    try {
      const res = await fetch(`/api/teacher/quizzes/${quizId}/activate`, { method: "POST" })
      const data = await res.json()
      
      if (res.ok) {
        toast.success(`"${title}" has been successfully activated as the weekly mock test!`)
        router.refresh()
      } else {
        toast.error(data.error || "Failed to activate mock test")
      }
    } catch (error) {
      console.error(error)
      toast.error("Error activating mock test")
    } finally {
      setLoading(false)
    }
  }

  // If already active, show the green badge and disable activation (requirement 4)
  if (isActive) {
    if (variant === "card") {
      return (
        <Badge className="w-full bg-emerald-600 hover:bg-emerald-600 text-white font-bold py-1.5 justify-center text-xs border-none select-none uppercase tracking-wide">
          🟢 Active Weekly Test
        </Badge>
      )
    }
    return (
      <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white border-none py-0.5 px-2 font-bold uppercase text-[9px] shrink-0 select-none">
        Active
      </Badge>
    )
  }

  const triggerButton = variant === "card" ? (
    <Button
      type="button"
      variant="default"
      size="sm"
      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
      onClick={handleActivateClick}
      disabled={loading}
    >
      {loading ? "Activating..." : "Activate as Weekly Test"}
    </Button>
  ) : (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="text-xs h-7 py-0 font-semibold border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
      onClick={handleActivateClick}
      disabled={loading}
    >
      {loading ? "Activating..." : "Activate"}
    </Button>
  )

  return (
    <>
      {triggerButton}

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>⚠️</span> Switch Active Mock Test
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              You are about to end the current weekly mock test.
            </DialogDescription>
          </DialogHeader>

          {currentActiveQuiz && (
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4 rounded-xl space-y-2.5 my-2">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Active Test</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">{currentActiveQuiz.title}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Participants</p>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{currentActiveQuiz.participantsCount} students</p>
              </div>
            </div>
          )}

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to activate <span className="font-extrabold text-slate-900 dark:text-white">"{title}"</span> as the new mock test?
          </p>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
              className="rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={performActivation}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
            >
              {loading ? "Activating..." : "Confirm & Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
