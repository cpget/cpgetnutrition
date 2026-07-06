"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Check, AlertTriangle, Clock, Menu } from "lucide-react"

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
  
  // Tab switch warning counter
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  
  // Mobile sidebar open state
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const [submitting, setSubmitting] = useState(false)
  
  // Timer State (Seconds remaining)
  const [timeLeft, setTimeLeft] = useState(duration * 60)

  // Prevent accidental reload or navigating away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = "Are you sure you want to leave the test? Your progress will be lost."
      return e.returnValue
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  // Track tab switching / minimizing window
  useEffect(() => {
    const handleBlur = () => {
      setTabSwitchCount((prev) => {
        const next = prev + 1
        alert(`SECURITY WARNING: You switched tabs or minimized the window! This action is logged for your teacher. Warning count: ${next}`)
        return next
      })
    }
    window.addEventListener("blur", handleBlur)
    return () => {
      window.removeEventListener("blur", handleBlur)
    }
  }, [])

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
      // Include the security metrics in the special _metadata block
      const submissionAnswers: Record<string, any> = {
        _metadata: {
          tabSwitchCount
        }
      }
      
      quiz.questions.forEach((q) => {
        submissionAnswers[q.id] = {
          selectedAnswer: answers[q.id] || "",
          isMarkedForReview: !!markedForReview[q.id]
        }
      })

      // Temporarily remove the beforeunload prompt during submission redirection
      const preventPrompt = () => {}
      window.removeEventListener("beforeunload", preventPrompt)

      const res = await fetch(`/api/quizzes/${quiz.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: submissionAnswers }),
      })

      if (res.ok) {
        // Temporarily clear event listeners to let push bypass the warning
        window.onbeforeunload = null
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
  }, [answers, markedForReview, quiz, router, submitting, tabSwitchCount])

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

  const formatCompactTime = () => {
    const totalMins = hours * 60 + minutes
    return `${String(totalMins).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

// Current Question Information
const sectionQuestionNum = currentIdx + 1

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
      {/* 1. Header Bar with Mobile Helper Tools */}
      <header className="h-14 bg-slate-200 border-b border-slate-300 flex items-center justify-between lg:justify-center px-4 md:px-6 shrink-0 shadow-sm relative">
        {/* Compact Mobile Timer */}
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold px-2 py-1 bg-slate-300/60 rounded border border-slate-300/80 text-slate-700 lg:hidden">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatCompactTime()}</span>
        </div>

        {/* Central Title */}
        <h1 className="text-sm md:text-base font-bold text-slate-800 tracking-wide text-center flex-1 lg:flex-none">
          Online Test - {quiz.title}
        </h1>

        {/* Urgent Indicator or Empty spacer */}
        {isUrgent ? (
          <div className="hidden lg:flex absolute right-6 items-center gap-1.5 text-red-600 text-xs font-bold animate-pulse">
            <AlertTriangle className="h-4 w-4" />
            Hurry Up!
          </div>
        ) : null}

        {/* Mobile Open Sidebar Toggle */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-xs font-bold px-2.5 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex items-center gap-1 shadow-sm shrink-0"
        >
          <Menu className="w-3.5 h-3.5" />
          <span>Palette</span>
        </button>
      </header>

      {/* 2. Main Split-Screen Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Left Column: Test Workspace */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6">
            
            {/* Workspace Question Header */}
            <div className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Question {sectionQuestionNum}</span>
              <div className="flex gap-2">
                {tabSwitchCount > 0 && (
                  <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded border border-red-200 font-extrabold">
                    {tabSwitchCount} Warning{tabSwitchCount > 1 ? "s" : ""}
                  </span>
                )}
                {isMarked && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-200 font-extrabold">
                    Review
                  </span>
                )}
              </div>
            </div>
            
            {/* Question Body */}
            <div className="text-base md:text-xl text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
              {currentQuestion.question}
            </div>
            
            {/* Options List */}
            <div className="space-y-3.5 max-w-3xl pt-3">
              {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                const optionKey = `option${letter}` as keyof Question
                const isSelected = answers[currentQuestion.id] === letter

                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => selectAnswer(letter)}
                    className={`w-full flex items-center p-3.5 rounded-xl border-2 transition-all group ${
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
          <div className="h-16 bg-slate-100 border-t border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              <button
                type="button"
                onClick={toggleMarkForReview}
                className={`text-[10px] md:text-sm font-bold px-2.5 py-2 md:px-4 md:py-2.5 rounded transition-all shadow-sm ${
                  isMarked
                    ? "bg-slate-700 hover:bg-slate-800 text-white"
                    : "bg-rose-700 hover:bg-rose-800 text-white"
                }`}
              >
                {isMarked ? "Unmark" : "Mark Review"}
              </button>
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentIdx === 0}
                className="text-[10px] md:text-sm font-bold px-2.5 py-2 md:px-4 md:py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentIdx === totalQuestions - 1}
                className="text-[10px] md:text-sm font-bold px-2.5 py-2 md:px-4 md:py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                Next
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => finishQuiz(false)}
                disabled={submitting}
                className="text-[10px] md:text-sm font-bold px-4 py-2 md:px-6 md:py-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
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

        {/* Right Column: Responsive Sidebar Drawer */}
        {/* Mobile slide-over backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className={`fixed inset-y-0 right-0 z-50 w-80 bg-slate-50 border-l border-slate-200 flex flex-col h-full transition-transform duration-300 lg:static lg:translate-x-0 shrink-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}>
          
          {/* Mobile Sidebar Header */}
          <div className="lg:hidden p-3 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
            <span className="font-extrabold text-xs text-slate-700 uppercase tracking-widest">Question Palette</span>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="text-xs font-bold bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded text-slate-600 transition-all border border-slate-200"
            >
              Close
            </button>
          </div>

          {/* Section 1: Time Left Countdown (Desktop only, as mobile displays in header) */}
          <div className="hidden lg:block p-4 border-b border-slate-200 text-center bg-white shadow-sm">
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

          {/* Question Palette */}
<div className="flex-1 overflow-y-auto bg-slate-50/50">
  <div className="border-b border-slate-200">
    <div className="bg-slate-200 text-slate-700 text-[10px] font-bold py-1.5 text-center uppercase tracking-widest">
      Questions
    </div>

    <div className="grid grid-cols-5 gap-2.5 p-4 justify-items-center">
      {quiz.questions.map((q, index) => {
        const status = getQuestionStatus(index)
        const statusColor = getStatusColor(status)

        return (
          <button
            key={q.id}
            type="button"
            onClick={() => {
              setCurrentIdx(index)
              setSidebarOpen(false)
            }}
            className={`w-9 h-9 flex items-center justify-center font-bold text-xs rounded transition-all shadow-sm ${statusColor}`}
          >
            {index + 1}
          </button>
        )
      })}
    </div>
  </div>
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