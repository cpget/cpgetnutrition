"use client"
import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function MockTestTakePage({ 
  quizId, 
  durationInMinutes 
}: { 
  quizId: string, 
  durationInMinutes: number 
}) {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(durationInMinutes * 60)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Use useCallback so it can be referenced safely in useEffect
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      // Replace with your actual submission logic
      const response = await fetch(`/api/student/quizzes/${quizId}/submit`, {
        method: "POST",
        body: JSON.stringify({ /* student answers */ })
      })

      if (response.ok) {
        toast.success("Mock Test submitted successfully!")
        router.push(`/dashboard/student/quizzes/${quizId}/result`)
      }
    } catch (error) {
      toast.error("Submission failed. Please contact your teacher.")
    }
  }, [quizId, isSubmitting, router])

  useEffect(() => {
    // If time runs out, auto-submit
    if (timeLeft <= 0) {
      toast.info("Time is up! Submitting your test automatically...")
      handleSubmit()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, handleSubmit])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Change color to red when less than 5 minutes remain
  const isUrgent = timeLeft < 300 

  return (
    <div className={`fixed top-4 right-4 px-6 py-3 rounded-xl font-mono text-lg font-bold shadow-lg border-2 transition-colors ${
      isUrgent 
      ? "bg-red-50 text-red-600 border-red-200 animate-pulse" 
      : "bg-white text-blue-600 border-blue-100"
    }`}>
      <span className="text-sm uppercase mr-2 opacity-70">Time Left:</span>
      {formatTime(timeLeft)}
    </div>
  )
}