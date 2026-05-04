"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Link as LinkIcon, Send } from "lucide-react"

export default function TeacherLivePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    topic: "",
    meetingLink: "",
  })

  async function handleGoLive() {
    if (!form.topic || !form.meetingLink) return
    
    setLoading(true)
    try {
      const res = await fetch("/api/live-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          scheduledAt: new Date().toISOString(), // Automatically set to "Now"
        }),
      })

      if (res.ok) {
        // 1. Open the meeting link in a new tab immediately
        window.open(form.meetingLink, "_blank")
        
        // 2. Reset form and refresh dashboard data
        setForm({ topic: "", meetingLink: "" })
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to go live:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-red-50 rounded-lg">
              <Video className="text-red-600 h-5 w-5" />
            </div>
            Start Live Class
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Class Topic</label>
            <Input 
              placeholder="e.g. Advanced Data Structures" 
              value={form.topic}
              onChange={(e) => setForm({...form, topic: e.target.value})}
              className="h-11 focus-visible:ring-red-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
              <LinkIcon className="h-3 w-3" /> Meeting Link
            </label>
            <Input 
              placeholder="https://meet.google.com/xxx-xxxx-xxx" 
              value={form.meetingLink}
              onChange={(e) => setForm({...form, meetingLink: e.target.value})}
              className="h-11 focus-visible:ring-red-500"
            />
          </div>

          <Button 
            onClick={handleGoLive} 
            className="w-full h-12 gap-2 font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-100" 
            disabled={loading || !form.topic || !form.meetingLink}
          >
            {loading ? "Initializing..." : (
              <>
                <Send className="h-4 w-4" /> 
                Go Live Now
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}