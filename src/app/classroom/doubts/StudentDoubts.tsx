"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type DoubtItem = {
  id: string
  question: string
  answer: string | null
  createdAt: string // ✅ now string
}

export default function StudentDoubts({ doubts }: { doubts: DoubtItem[] }) {
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const submitDoubt = async () => {
    if (!question.trim()) return

    setLoading(true)
    await fetch("/api/doubts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    })

    setQuestion("")
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ask a doubt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Ask your doubt..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button onClick={submitDoubt} disabled={loading || !question.trim()}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {doubts.length === 0 ? (
          <p className="text-muted-foreground">No doubts yet.</p>
        ) : (
          doubts.map((d) => (
            <Card key={d.id}>
              <CardHeader>
                <CardTitle className="text-base">{d.question}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {/* ✅ stable: no locale mismatch */}
                  {new Date(d.createdAt).toUTCString()}
                </p>
              </CardHeader>
              <CardContent>
                {d.answer ? (
                  <div className="bg-green-50 p-3 rounded text-green-700">
                    <strong>Teacher Answer:</strong>
                    <p>{d.answer}</p>
                  </div>
                ) : (
                  <p className="text-yellow-600 text-sm">
                    Awaiting teacher response...
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}