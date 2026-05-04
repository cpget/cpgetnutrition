"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type Props = {
  doubtId: string
  initialAnswer?: string
}

export default function AnswerDoubtForm({
  doubtId,
  initialAnswer,
}: Props) {
  const [answer, setAnswer] = useState(initialAnswer ?? "")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const isEditing = Boolean(initialAnswer)
  const trimmedAnswer = answer.trim()

  // 🔄 Auto hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [success])

  async function handleSubmit() {
    if (!trimmedAnswer) return

    // 🚫 Prevent update if nothing changed
    if (isEditing && trimmedAnswer === initialAnswer) {
      return
    }

    try {
      setLoading(true)
      setError("")
      setSuccess(false)

      const res = await fetch(`/api/doubts/${doubtId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: trimmedAnswer }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || "Something went wrong")
      }

      // ✅ Clear only if new submission
      if (!isEditing) {
        setAnswer("")
      }

      setSuccess(true)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to submit answer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        className="w-full border p-2 rounded"
        placeholder="Write your answer..."
        value={answer}
        onChange={(e) => {
          setAnswer(e.target.value)
          setSuccess(false)
        }}
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !trimmedAnswer}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading
          ? isEditing
            ? "Updating..."
            : "Submitting..."
          : isEditing
          ? "Update Answer"
          : "Submit Answer"}
      </button>

      {success && (
        <p className="text-green-600 text-sm">
          {isEditing
            ? "Answer updated successfully ✔"
            : "Answer submitted successfully ✔"}
        </p>
      )}

      {error && (
        <p className="text-red-600 text-sm">
          {error}
        </p>
      )}
    </div>
  )
}
