"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AnswerForm({ doubtId }: { doubtId: string }) {
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!answer) return

    setLoading(true)

    await fetch(`/api/doubts/${doubtId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer }),
    })

    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Write your answer..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Submitting..." : "Submit Answer"}
      </Button>
    </div>
  )
}