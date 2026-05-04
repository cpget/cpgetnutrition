"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress" // Assuming shadcn progress
import { Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Question = {
  id: string
  question: string
  options: string[]
}

type QuizProps = {
  quizId: string
  quizTitle: string
  questions: Question[]
  timeLimitInMinutes?: number // New prop
}

export default function QuizPlay({ 
  quizId, 
  quizTitle, 
  questions, 
  timeLimitInMinutes = 10 
}: QuizProps) {
  const router = useRouter()
  
  const [loading, setLoading] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState(timeLimitInMinutes * 60)
  const [isTimeUp, setIsTimeUp] = useState(false)

  // 1. Map index (0-3) to Char (A-D) for Database compatibility
  const mapIndexToLetter = (index: number) => ["A", "B", "C", "D"][index]

  // 2. Submit Logic (Wrapped in useCallback to use inside useEffect safely)
  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (loading) return
    
    // If user is manually submitting, check if all answered
    if (!isAutoSubmit && Object.keys(selectedAnswers).length < questions.length) {
      if (!confirm("You haven't answered all questions. Submit anyway?")) return
    }

    try {
      setLoading(true)

      // Convert indices to Letters (e.g., 0 -> "A")
      const formattedAnswers = Object.entries(selectedAnswers).reduce((acc, [qId, idx]) => {
        acc[qId] = mapIndexToLetter(idx)
        return acc;
      }, {} as Record<string, string>)

      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formattedAnswers }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`Quiz Finished! Your score: ${data.score}/${data.totalQuestions}`)
        router.push("/classroom/quizzes")
        router.refresh()
      }
    } catch (err: any) {
      console.error(err)
      alert("Error submitting quiz. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }, [loading, quizId, router, selectedAnswers, questions.length])

  // 3. Timer Effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsTimeUp(true)
      handleSubmit(true) // Trigger auto-submit
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

  // Calculate progress percentage for the bar
  const progressValue = (timeLeft / (timeLimitInMinutes * 60)) * 100

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 pb-24">
      {/* Sticky Timer Header */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur p-4 border rounded-xl shadow-sm space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold truncate pr-4">{quizTitle}</h1>
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full font-mono font-bold",
            timeLeft < 60 ? "bg-red-100 text-red-600 animate-pulse" : "bg-blue-50 text-blue-700"
          )}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
        <Progress value={progressValue} className={cn(
          "h-2", 
          timeLeft < 60 ? "[&>div]:bg-red-500" : "[&>div]:bg-blue-600"
        )} />
      </div>

      {isTimeUp && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium">Time is up! Submitting your answers automatically...</p>
        </div>
      )}

      <div className="space-y-10">
        {questions.map((q, index) => (
          <div key={q.id} className="space-y-4">
            <p className="font-semibold text-lg flex gap-3">
              <span className="text-blue-600">Q{index + 1}.</span>
              {q.question}
            </p>
            <div className="grid gap-3 pl-8">
              {q.options.map((option, idx) => (
                <button
                  key={idx}
                  disabled={loading || isTimeUp}
                  onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: idx }))}
                  className={cn(
                    "p-4 text-left border-2 rounded-xl transition-all relative overflow-hidden group",
                    selectedAnswers[q.id] === idx
                      ? "border-blue-600 bg-blue-50/50 text-blue-700"
                      : "border-slate-100 hover:border-slate-300 bg-white"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold",
                      selectedAnswers[q.id] === idx 
                        ? "bg-blue-600 border-blue-600 text-white" 
                        : "bg-slate-50 border-slate-200 text-slate-500 group-hover:bg-slate-100"
                    )}>
                      {mapIndexToLetter(idx)}
                    </span>
                    {option}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t md:relative md:bg-transparent md:border-0 md:p-0">
        <Button 
          onClick={() => handleSubmit(false)} 
          disabled={loading || isTimeUp} 
          className="w-full h-14 text-xl font-bold shadow-lg shadow-blue-200"
        >
          {loading ? "Processing..." : "Finish and Submit"}
        </Button>
      </div>
    </div>
  )
}