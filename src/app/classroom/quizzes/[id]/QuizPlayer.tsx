"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Send, Loader2, Clock, AlertTriangle } from "lucide-react"

interface Question {
  id: string
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
}

interface Quiz {
  id: string
  title: string
  questions: Question[]
}

export default function QuizPlayer({ quiz, duration }: { quiz: Quiz, duration: number }) {
  const router = useRouter()
  
  // Quiz State
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  
  // ⏱️ Timer State (Minutes to Seconds)
  const [timeLeft, setTimeLeft] = useState(duration * 60)

  // 1. Memoized Submission Logic
  const finishQuiz = useCallback(async (isAutoSubmit = false) => {
    if (submitting) return

    // Don't ask for confirmation if the timer ran out
    if (!isAutoSubmit) {
      const answeredCount = Object.keys(answers).length
      if (answeredCount < quiz.questions.length) {
        if (!confirm(`You've answered ${answeredCount}/${quiz.questions.length}. Submit anyway?`)) return
      }
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })

      if (res.ok) {
        router.push(`/classroom/quizzes/${quiz.id}/result`)
        router.refresh()
      } else {
        alert("Submission failed. Please check your connection.")
        setSubmitting(false)
      }
    } catch (e) {
      alert("An error occurred.")
      setSubmitting(false)
    }
  }, [answers, quiz, router, submitting])

  // 2. Timer Effect
  useEffect(() => {
    if (timeLeft <= 0) {
      finishQuiz(true) // Auto-submit when time hits 0
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, finishQuiz])

  // Helpers for UI
  const currentQuestion = quiz.questions[currentIdx]
  const totalQuestions = quiz.questions.length
  const progress = ((currentIdx + 1) / totalQuestions) * 100
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const isUrgent = timeLeft < 60 // Less than 1 minute

  return (
    <div className="space-y-6">
      {/* ⏱️ Sticky Timer Header */}
      <div className={`sticky top-4 z-30 flex items-center justify-between p-4 rounded-2xl border-2 shadow-lg transition-all ${
        isUrgent ? "bg-red-50 border-red-500 animate-pulse" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isUrgent ? "bg-red-500 text-white" : "bg-blue-100 text-blue-600"}`}>
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Time Remaining</p>
            <p className={`text-2xl font-mono font-black ${isUrgent ? "text-red-600" : "text-slate-800"}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>
        {isUrgent && (
          <div className="hidden md:flex items-center gap-2 text-red-600 font-bold text-sm">
            <AlertTriangle className="h-4 w-4" />
            Hurry up!
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-500">
          <span>QUESTION {currentIdx + 1} OF {totalQuestions}</span>
          <span>{Math.round(progress)}% COMPLETE</span>
        </div>
        <Progress value={progress} className="h-2 bg-slate-100" />
      </div>

      {/* Question Card */}
      <Card className="border-none shadow-2xl overflow-hidden bg-white">
        <CardHeader className="p-8 bg-slate-50/50 border-b">
          <CardTitle className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8 space-y-6">
          <RadioGroup 
            value={answers[currentQuestion.id] || ""} 
            onValueChange={(val) => setAnswers({...answers, [currentQuestion.id]: val})}
            className="grid gap-4"
          >
            {(['A', 'B', 'C', 'D'] as const).map((letter) => {
              const optionKey = `option${letter}` as keyof Question
              const isSelected = answers[currentQuestion.id] === letter

              return (
                <div key={letter}>
                  <RadioGroupItem value={letter} id={`${currentQuestion.id}-${letter}`} className="sr-only" />
                  <Label 
                    htmlFor={`${currentQuestion.id}-${letter}`} 
                    className={`flex items-center space-x-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected 
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600/20" 
                      : "border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-xl border-2 font-black transition-colors ${
                      isSelected ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-400"
                    }`}>
                      {letter}
                    </div>
                    <span className={`text-lg font-medium ${isSelected ? "text-blue-900" : "text-slate-700"}`}>
                      {currentQuestion[optionKey]}
                    </span>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 mt-6 border-t border-slate-100">
            <Button 
              variant="ghost" 
              onClick={() => setCurrentIdx(prev => prev - 1)} 
              disabled={currentIdx === 0 || submitting}
              className="font-bold"
            >
              <ChevronLeft className="h-5 w-5 mr-1" /> Previous
            </Button>
            
            {currentIdx === totalQuestions - 1 ? (
              <Button 
                onClick={() => finishQuiz(false)} 
                disabled={submitting} 
                className="bg-green-600 hover:bg-green-700 text-white px-10 h-12 rounded-xl font-bold shadow-lg shadow-green-200"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Quiz"}
              </Button>
            ) : (
              <Button 
                onClick={() => setCurrentIdx(prev => prev + 1)} 
                disabled={!answers[currentQuestion.id]}
                className="bg-blue-600 hover:bg-blue-700 px-10 h-12 rounded-xl font-bold shadow-lg shadow-blue-200"
              >
                Next <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}