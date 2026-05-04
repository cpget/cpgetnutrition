"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // Changed to Input for a single link
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Link2, ExternalLink, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function AssignmentSubmissionPage() {
  const { id } = useParams()
  const router = useRouter()
  const [driveLink, setDriveLink] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [fetching, setFetching] = React.useState(true)

  React.useEffect(() => {
    async function getSubmission() {
      try {
        const res = await fetch(`/api/assignments/${id}/submission`)
        if (res.ok) {
          const data = await res.json()
          if (data?.content) setDriveLink(data.content)
        }
      } finally {
        setFetching(false)
      }
    }
    getSubmission()
  }, [id])

  async function handleSubmit() {
    // Basic validation to ensure it looks like a link
    if (!driveLink.startsWith("http")) {
      alert("Please provide a valid Google Drive link starting with http:// or https://")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/assignments/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: driveLink }), // Sending the link as a string
      })

      if (res.ok) {
        router.push("/classroom/assignments")
        router.refresh()
      } else {
        alert("Failed to submit link.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Link href="/classroom/assignments">
        <Button variant="ghost" size="sm" className="gap-2 text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Return to Coursework
        </Button>
      </Link>

      <Card className="border-slate-200 shadow-xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Link2 className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl">Submit via Google Drive</CardTitle>
          </div>
          <CardDescription className="text-slate-500 text-base">
            Upload your file to Google Drive, ensure "Anyone with the link" can view, and paste the link below.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Document Link</label>
            <div className="relative">
              <Input 
                placeholder="https://drive.google.com/file/d/..."
                className="h-12 pl-4 pr-10 border-slate-200 focus-visible:ring-indigo-500"
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
              />
              <ExternalLink className="absolute right-3 top-3.5 h-5 w-5 text-slate-300" />
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading || !driveLink} 
            className="w-full h-12 gap-2 text-base font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
            {loading ? "Updating Records..." : "Finalize Submission"}
          </Button>

          <div className="rounded-xl bg-amber-50 p-4 border border-amber-100">
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Tip:</strong> Make sure your link permissions are set to <strong>"Anyone with the link can view"</strong> so your instructor can grade your work.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}