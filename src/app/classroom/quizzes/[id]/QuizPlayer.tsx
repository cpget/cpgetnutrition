"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Check, AlertTriangle } from "lucide-react"

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
  
  // Active Question Index
  const [currentIdx, setCurrentIdx] = useState(0)
  
  // Selected Answers (questionId -> Option Letter)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  
  // Marked for Review State (questionId -> boolean)
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({})
  
  // Visited State (questionId -> boolean)
  const [visited, setVisited] = useState<Record<string, boolean>>(() => {
    if (quiz.questions.length > 0) {
      return { [quiz.questions[0].id]: true }
    }
    return {}
  })
  
  const [submitting, setSubmitting] = useState(false)
  
  // Timer State (Seconds remaining)
  const [timeLeft, setTimeLeft] = useState(duration * 60)

  // 1. Memoized Submission Logic
  const finishQuiz = useCallback(async (isAutoSubmit = false) => {
    if (submitting) return

    // Don't ask for confirmation if the timer ran out
    if (!isAutoSubmit) {
      const answeredCount = Object.keys(answers).length
      if (answeredCount < quiz.questions.length) {
        if (!confirm(`You've answered ${answeredCount}/${quiz.questions.length}. Submit anyway?`)) return
      } else {
        if (!confirm("Are you sure you want to submit your test?")) return
      }
    }

    setSubmitting(true)
    try {
      // Map selections to the new schema format: { [id]: { selectedAnswer, isMarkedForReview } }
      const submissionAnswers: Record<string, { selectedAnswer: string, isMarkedForReview: boolean }> = {}
      quiz.questions.forEach((q) => {
        submissionAnswers[q.id] = {
          selectedAnswer: answers[q.id] || "",
          isMarkedForReview: !!markedForReview[q.id]
        }
      })

      const res = await fetch(`/api/quizzes/${quiz.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: submissionAnswers }),
      })

      if (res.ok) {
        router.push(`/classroom/quizzes/${quiz.id}/result`)
        router.refresh()
      } else {
        const errData = await res.json()
        alert(errData.error || "Submission failed. Please check your connection.")
        setSubmitting(false)
      }
    } catch (e) {
      alert("An error occurred during submission.")
      setSubmitting(false)
    }
  }, [answers, markedForReview, quiz, router, submitting])

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

  // 3. Mark current question as visited
  useEffect(() => {
    if (quiz.questions.length > 0 && quiz.questions[currentIdx]) {
      const activeId = quiz.questions[currentIdx].id
      setVisited((prev) => {
        if (prev[activeId]) return prev
        return { ...prev, [activeId]: true }
      })
    }
  }, [currentIdx, quiz.questions])

  // Navigation helpers
  const currentQuestion = quiz.questions[currentIdx]
  const totalQuestions = quiz.questions.length

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1)
    }
  }

  const toggleMarkForReview = () => {
    if (!currentQuestion) return
    const qId = currentQuestion.id
    setMarkedForReview((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }))
  }

  const selectAnswer = (letter: string) => {
    if (!currentQuestion) return
    const qId = currentQuestion.id
    setAnswers((prev) => ({
      ...prev,
      [qId]: letter
    }))
  }

  // Timer Breakdown
  const hours = Math.floor(timeLeft / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)
  const seconds = timeLeft % 60
  const isUrgent = timeLeft < 300 // less than 5 minutes

  // Question Sections Grouping
  const quantCount = Math.max(1, Math.ceil(totalQuestions / 2))
  const quantQuestions = quiz.questions.slice(0, quantCount)
  const verbalQuestions = quiz.questions.slice(quantCount)

  // Current Question Information
  const isQuant = currentIdx < quantCount
  const sectionName = isQuant ? "Quant" : "Verbal"
  const sectionQuestionNum = isQuant ? currentIdx + 1 : currentIdx - quantCount + 1

  // Status mapping for navigation grids
  const getQuestionStatus = (idx: number) => {
    const q = quiz.questions[idx]
    if (!q) return "unvisited"
    if (idx === currentIdx) return "current"
    if (markedForReview[q.id]) return "marked"
    if (answers[q.id]) return "answered"
    if (visited[q.id]) return "skipped"
    return "unvisited"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "current":
        return "bg-indigo-600 text-white border-2 border-indigo-700 ring-2 ring-indigo-300/50"
      case "marked":
        return "bg-amber-500 text-white border-2 border-amber-600 hover:bg-amber-600"
      case "answered":
        return "bg-emerald-600 text-white border-2 border-emerald-700 hover:bg-emerald-700"
      case "skipped":
        return "bg-red-500 text-white border-2 border-red-600 hover:bg-red-600"
      case "unvisited":
      default:
        return "bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-300"
    }
  }

  if (totalQuestions === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 flex items-center justify-center p-6 text-center">
        <div>
          <AlertTriangle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700">No Questions</h2>
          <p className="text-slate-500 text-sm mt-1">This quiz does not contain any questions.</p>
        </div>
      </div>
    )
  }

  const isMarked = !!markedForReview[currentQuestion.id]

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col w-screen h-screen overflow-hidden text-slate-900 select-none">
      {/* 1. Centered Header Bar */}
      <header className="h-14 bg-slate-200 border-b border-slate-300 flex items-center justify-center px-6 shrink-0 shadow-sm relative">
        <h1 className="text-base font-bold text-slate-800 tracking-wide">
          Online Test - {quiz.title}
        </h1>
        {isUrgent && (
          <div className="absolute right-4 hidden md:flex items-center gap-1.5 text-red-600 text-xs font-bold animate-pulse">
            <AlertTriangle className="h-4 w-4" />
            Hurry Up!
          </div>
        )}
      </header>

      {/* 2. Main Dashboard Split-Screen Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Column: Test Workspace */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6">
            
            {/* Workspace Question Header */}
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>{sectionName} - Question {sectionQuestionNum}</span>
              {isMarked && (
                <span className="bg-amber-100 text-amber-800 text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-200 font-extrabold animate-pulse">
                  Review Requested
                </span>
              )}
            </div>
            
            {/* Question Body */}
            <div className="text-lg md:text-xl text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
              {currentQuestion.question}
            </div>
            
            {/* Options List */}
            <div className="space-y-4 max-w-3xl pt-4">
              {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                const optionKey = `option${letter}` as keyof Question
                const isSelected = answers[currentQuestion.id] === letter

                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => selectAnswer(letter)}
                    className={`w-full flex items-center p-4 rounded-xl border-2 transition-all group ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/30 text-emerald-950 font-semibold shadow-sm"
                        : "border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 text-slate-700"
                    }`}
                  >
                    {/* Checkbox indicator */}
                    <div className={`w-5 h-5 rounded border mr-4 flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-300 bg-white group-hover:border-slate-400"
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3.5]" />}
                    </div>
                    
                    {/* Letter block */}
                    <span className={`text-sm font-black mr-2 transition-colors ${isSelected ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-500"}`}>
                      {letter}.
                    </span>
                    
                    {/* Option Text */}
                    <span className="text-sm md:text-base text-left flex-1 leading-normal">
                      {currentQuestion[optionKey]}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sticky Bottom Action Footer */}
          <div className="h-16 bg-slate-100 border-t border-slate-200 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMarkForReview}
                className={`text-xs md:text-sm font-bold px-4 py-2.5 rounded transition-all shadow-sm ${
                  isMarked
                    ? "bg-slate-700 hover:bg-slate-800 text-white"
                    : "bg-rose-700 hover:bg-rose-800 text-white"
                }`}
              >
                {isMarked ? "Unmark Review" : "Mark for Review"}
              </button>
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentIdx === 0}
                className="text-xs md:text-sm font-bold px-4 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentIdx === totalQuestions - 1}
                className="text-xs md:text-sm font-bold px-4 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => finishQuiz(false)}
                disabled={submitting}
                className="text-xs md:text-sm font-bold px-6 py-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Submit Test</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Dashboard */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col h-full bg-slate-50 shrink-0">
          
          {/* Section 1: Time Left Countdown */}
          <div className="p-4 border-b border-slate-200 text-center bg-white shadow-sm">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
              Time Left
            </div>
            <div className="flex justify-center items-center gap-3">
              <div className="text-center w-12">
                <span className={`text-2xl font-mono font-bold block ${isUrgent ? "text-red-600" : "text-slate-800"}`}>
                  {String(hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                  Hours
                </span>
              </div>
              <span className="text-xl font-bold text-slate-300 mb-4">:</span>
              <div className="text-center w-12">
                <span className={`text-2xl font-mono font-bold block ${isUrgent ? "text-red-600" : "text-slate-800"}`}>
                  {String(minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                  Minutes
                </span>
              </div>
              <span className="text-xl font-bold text-slate-300 mb-4">:</span>
              <div className="text-center w-12">
                <span className={`text-2xl font-mono font-bold block ${isUrgent ? "text-red-600" : "text-slate-800"}`}>
                  {String(seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">
                  seconds
                </span>
              </div>
            </div>
          </div>

          {/* Section 2 & 3: Collapsible or clear Question Navigation Palettes */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50">
            {/* Quant palette */}
            {quantQuestions.length > 0 && (
              <div className="border-b border-slate-200">
                <div className="bg-slate-200 text-slate-700 text-[10px] font-bold py-1.5 text-center uppercase tracking-widest">
                  Quant
                </div>
                <div className="grid grid-cols-5 gap-2 p-4 justify-items-center">
                  {quantQuestions.map((q, qIdx) => {
                    const globalIdx = qIdx
                    const status = getQuestionStatus(globalIdx)
                    const statusColor = getStatusColor(status)
                    
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIdx(globalIdx)}
                        className={`w-9 h-9 flex items-center justify-center font-bold text-xs rounded transition-all shadow-sm ${statusColor}`}
                      >
                        {qIdx + 1}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Verbal palette */}
            {verbalQuestions.length > 0 && (
              <div className="border-b border-slate-200">
                <div className="bg-slate-200 text-slate-700 text-[10px] font-bold py-1.5 text-center uppercase tracking-widest">
                  Verbal
                </div>
                <div className="grid grid-cols-5 gap-2 p-4 justify-items-center">
                  {verbalQuestions.map((q, qIdx) => {
                    const globalIdx = quantCount + qIdx
                    const status = getQuestionStatus(globalIdx)
                    const statusColor = getStatusColor(status)
                    
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIdx(globalIdx)}
                        className={`w-9 h-9 flex items-center justify-center font-bold text-xs rounded transition-all shadow-sm ${statusColor}`}
                      >
                        {qIdx + 1}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Legend Key Footer */}
          <div className="p-4 border-t border-slate-200 bg-white grid grid-cols-2 gap-2.5 text-[9px] font-black text-slate-500 tracking-wider uppercase shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-indigo-600 border border-indigo-700 inline-block shadow-sm"></span>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-slate-200 border border-slate-300 inline-block shadow-sm"></span>
              <span>Not Visited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-emerald-600 border border-emerald-700 inline-block shadow-sm"></span>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-red-500 border border-red-600 inline-block shadow-sm"></span>
              <span>Not Answered</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2 justify-center pt-2 border-t border-slate-100 mt-1">
              <span className="w-3.5 h-3.5 rounded-sm bg-amber-500 border border-amber-600 inline-block shadow-sm"></span>
              <span>Review Requested</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}