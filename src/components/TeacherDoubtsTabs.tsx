"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AnswerDoubtForm from "./AnswerDoubtForm"

type Doubt = {
  id: string
  question: string
  answer: string | null
  createdAt: string | Date
  student: {
    name: string | null
    email: string
  }
}

export default function TeacherDoubtsTabs({ doubts }: { doubts: Doubt[] }) {
  const [mounted, setMounted] = useState(false)
  const unanswered = doubts.filter((d) => !d.answer)
  const answered = doubts.filter((d) => d.answer)
  const router = useRouter()

  // 1. Handle Mounting to prevent hydration mismatch
  // 2. Refresh logic
  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      router.refresh()
    }, 5000)

    return () => clearInterval(interval)
  }, [router])

  // Helper function to format date consistently in India Time
  const formatIndiaTime = (date: string | Date) => {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  return (
    <Tabs defaultValue="unanswered" className="w-full space-y-6">
      <TabsList>
        <TabsTrigger value="unanswered" className="flex gap-2">
          Unanswered
          <Badge variant="destructive">{unanswered.length}</Badge>
        </TabsTrigger>

        <TabsTrigger value="answered" className="flex gap-2">
          Answered
          <Badge variant="secondary">{answered.length}</Badge>
        </TabsTrigger>
      </TabsList>

      {/* Unanswered */}
      <TabsContent value="unanswered" className="space-y-4">
        {unanswered.length === 0 ? (
          <p className="text-muted-foreground">No unanswered doubts 🎉</p>
        ) : (
          unanswered.map((doubt) => (
            <Card key={doubt.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {doubt.student.name ?? doubt.student.email}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {/* Only render the date string after the component has mounted on the client */}
                    {mounted ? formatIndiaTime(doubt.createdAt) : "Loading..."}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p>{doubt.question}</p>
                <AnswerDoubtForm doubtId={doubt.id} />
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      {/* Answered */}
      <TabsContent value="answered" className="space-y-4">
        {answered.length === 0 ? (
          <p className="text-muted-foreground">No answered doubts yet.</p>
        ) : (
          answered.map((doubt) => (
            <Card key={doubt.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    {doubt.student.name ?? doubt.student.email}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {mounted ? formatIndiaTime(doubt.createdAt) : "Loading..."}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p>{doubt.question}</p>
                <AnswerDoubtForm
                  doubtId={doubt.id}
                  initialAnswer={doubt.answer ?? ""}
                />
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>
    </Tabs>
  )
}