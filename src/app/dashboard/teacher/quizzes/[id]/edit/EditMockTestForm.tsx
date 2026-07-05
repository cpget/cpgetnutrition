"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, Save, ArrowLeft, Loader2, Lock } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface QuestionData {
  id?: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
}

export default function EditMockTestForm({ initialData }: { initialData: any }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const forceEdit = searchParams.get("edit") === "true"
  const isLocked = !!initialData.isLocked && !forceEdit
  
  const [loading, setLoading] = useState(false)
  const [isDraftState, setIsDraftState] = useState(initialData.isDraft ?? false)
  
  const [formData, setFormData] = useState({
    title: initialData.title,
    description: initialData.description || "",
    duration: initialData.duration.toString(),
  })

  const [questions, setQuestions] = useState<QuestionData[]>(initialData.questions)

  const addQuestion = () => {
    if (isLocked) return
    setQuestions([...questions, { 
      question: "", optionA: "", optionB: "", optionC: "", optionD: "", answer: "A" 
    }])
    toast.info("New question added")
  }

  const removeQuestion = (index: number) => {
    if (isLocked) return
    if (questions.length === 1) {
      toast.error("At least one question is required.")
      return
    }
    setQuestions(questions.filter((_: QuestionData, i: number) => i !== index))
    toast.warning("Question removed")
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return
    setLoading(true)

    try {
      const res = await fetch(`/api/teacher/quizzes/${initialData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, questions, isDraft: isDraftState }),
      })

      if (res.ok) {
        toast.success("Mock Test updated successfully!")
        router.push("/dashboard/teacher/quizzes")
        router.refresh()
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || "Failed to update Mock Test")
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleUpdate} className="space-y-8 pb-20">
      {/* Locked Warning Banner */}
      {initialData.isLocked && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-5 rounded-3xl flex items-start gap-4 text-amber-800 dark:text-amber-300 shadow-sm animate-pulse-subtle">
          <span className="text-xl leading-none">🔒</span>
          <div>
            <p className="font-extrabold text-sm uppercase tracking-wide">
              {forceEdit ? "Mock Test Locked (Edit Mode)" : "Mock Test Locked"}
            </p>
            <p className="text-xs mt-1 leading-relaxed text-amber-700/80 dark:text-amber-400/80">
              {forceEdit 
                ? "This test has attempts, but you are in Edit Mode. Changes here will take effect immediately. Please be careful to not disrupt grade/leaderboard integrity."
                : "This mock test has already received student attempts. To protect leaderboard and grade integrity, editing questions, answers, timing, or description has been disabled."}
            </p>
          </div>
        </div>
      )}

      {/* Test Details Card */}
      <Card className="border-blue-100 shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Mock Test Title</Label>
            <Input 
              id="title" 
              placeholder="e.g. Mathematics Entrance Mock"
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              required 
              disabled={isLocked}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="duration">Duration (Minutes)</Label>
            <Input 
              id="duration" 
              type="number"
              value={formData.duration} 
              onChange={(e) => setFormData({...formData, duration: e.target.value})} 
              required 
              disabled={isLocked}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea 
              id="description" 
              placeholder="Provide instructions for students..."
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              disabled={isLocked}
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input 
              id="isDraft"
              type="checkbox"
              checked={isDraftState}
              onChange={(e) => setIsDraftState(e.target.checked)}
              disabled={isLocked}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <Label htmlFor="isDraft" className="text-sm font-semibold text-slate-700 cursor-pointer select-none">
              Keep as Draft (students won't see this test)
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-slate-100 p-4 rounded-lg">
          <h2 className="text-xl font-bold text-slate-700">Questions ({questions.length})</h2>
          {!isLocked && (
            <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="bg-white">
              <Plus className="h-4 w-4 mr-2" /> Add Question
            </Button>
          )}
        </div>

        {questions.map((q, index) => (
          <Card key={index} className="relative border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md">
            {!isLocked && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 text-slate-400 hover:text-destructive transition-colors"
                onClick={() => removeQuestion(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-2">
                <Label className="text-blue-600 font-bold">Question {index + 1}</Label>
                <Input 
                  value={q.question} 
                  placeholder="Enter the question text here..."
                  onChange={(e) => {
                    if (isLocked) return
                    const newQs = [...questions]
                    newQs[index].question = e.target.value
                    setQuestions(newQs)
                  }} 
                  required 
                  disabled={isLocked}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                  <div key={opt} className="grid gap-2">
                    <Label className="text-xs text-slate-500">Option {opt}</Label>
                    <Input 
                      value={(q as any)[`option${opt}`]} 
                      onChange={(e) => {
                        if (isLocked) return
                        const newQs = [...questions]
                        ;(newQs[index] as any)[`option${opt}`] = e.target.value
                        setQuestions(newQs)
                      }} 
                      required 
                      disabled={isLocked}
                    />
                  </div>
                ))}
              </div>
              <div className="grid gap-2 bg-slate-50 p-3 rounded-md">
                <Label className="text-xs font-bold uppercase text-slate-500">Correct Answer</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  value={q.answer}
                  onChange={(e) => {
                    if (isLocked) return
                    const newQs = [...questions]
                    newQs[index].answer = e.target.value
                    setQuestions(newQs)
                  }}
                  disabled={isLocked}
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex justify-between items-center w-[90%] max-w-4xl p-4 bg-white/80 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl z-50">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/teacher/quizzes"><ArrowLeft className="mr-2 h-4 w-4" /> Back to List</Link>
        </Button>
        <div className="flex gap-3">
          <Button 
            type="submit" 
            disabled={loading || isLocked} 
            className="bg-blue-600 hover:bg-blue-700 px-8 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:bg-slate-300 disabled:text-slate-600 dark:disabled:bg-white/5 dark:disabled:text-slate-500"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLocked ? (
              <><Lock className="mr-2 h-4 w-4" /> Mock Test Locked</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Save Mock Test</>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}