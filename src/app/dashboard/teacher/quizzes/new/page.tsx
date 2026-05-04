"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label" // Added for better UX
import { Trash2, Plus, ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"

export default function CreateQuizPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("30") // ⏱️ New state for timer
  
  const [questions, setQuestions] = useState([
    { question: "", optionA: "", optionB: "", optionC: "", optionD: "", answer: "A" }
  ])

  const addQuestion = () => {
    setQuestions([...questions, { question: "", optionA: "", optionB: "", optionC: "", optionD: "", answer: "A" }])
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: string, value: string) => {
    const newQs = [...questions]
    newQs[index] = { ...newQs[index], [field]: value }
    setQuestions(newQs)
  }

  const handleSubmit = async () => {
    if (!title.trim()) return alert("Please enter a Quiz Title")
    if (!duration || parseInt(duration) <= 0) return alert("Please enter a valid duration (minutes)")
    if (questions.some(q => !q.question.trim())) return alert("Please fill in all question texts")

    setLoading(true)
    try {
      const res = await fetch("/api/teacher/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          description, 
          duration: parseInt(duration), // ✅ Sending duration to backend
          questions 
        }),
      })

      if (res.ok) {
        router.push("/dashboard/teacher/quizzes")
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to publish quiz")
      }
    } catch (error) {
      alert("Network error. Check your server console.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <Link href="/dashboard/teacher/quizzes">
        <Button variant="ghost" size="sm" className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Mock Test
        </Button>
      </Link>

      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Mock Test </h1>
          <p className="text-muted-foreground text-sm">Design your assessment for CPGET students.</p>
        </div>
        <Button onClick={handleSubmit} disabled={loading} className="px-8 bg-blue-600 hover:bg-blue-700">
          {loading ? "Publishing..." : "Publish Quiz"}
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>General Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Mock Test  Title</Label>
            <Input 
              id="title"
              placeholder="e.g. Macronutrients & Metabolism" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="text-lg font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Minutes)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="duration"
                  type="number"
                  placeholder="30" 
                  value={duration} 
                  onChange={(e) => setDuration(e.target.value)} 
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Description (Optional)</Label>
            <Textarea 
              id="desc"
              placeholder="Provide instructions or a brief summary of the quiz..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <Card key={index} className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between py-3 bg-slate-50/50">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Question {index + 1}</span>
              {questions.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeQuestion(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Input 
                placeholder="Type the question here..." 
                value={q.question} 
                onChange={(e) => updateQuestion(index, "question", e.target.value)} 
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['optionA', 'optionB', 'optionC', 'optionD'] as const).map((opt) => (
                  <div key={opt} className="flex items-center gap-2 group">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold border group-focus-within:bg-blue-600 group-focus-within:text-white transition-colors">
                      {opt.slice(-1)}
                    </span>
                    <Input 
                      placeholder={`Choice ${opt.slice(-1)}`} 
                      value={q[opt]} 
                      onChange={(e) => updateQuestion(index, opt, e.target.value)} 
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Correct Answer:</span>
                <select 
                  className="border rounded-md px-3 py-1 text-sm font-medium bg-white hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={q.answer}
                  onChange={(e) => updateQuestion(index, "answer", e.target.value)}
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

      <Button variant="outline" className="w-full border-dashed py-6 hover:bg-blue-50 hover:text-blue-600 transition-all" onClick={addQuestion}>
        <Plus className="mr-2 h-4 w-4" /> Add Another Question
      </Button>
    </div>
  )
}