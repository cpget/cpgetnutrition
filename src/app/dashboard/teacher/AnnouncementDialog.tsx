"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Megaphone, Trash2 } from "lucide-react"

export default function AnnouncementDialog() {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleSubmit() {
    if (!content.trim()) return
    setLoading(true)

    try {
      const res = await fetch("/api/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Sending an empty string or null for title to maintain API compatibility
        body: JSON.stringify({ title: "", content }),
      })

      if (res.ok) {
        setContent("")
        setOpen(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to post:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete the current announcement?")) return
    setLoading(true)

    try {
      await fetch("/api/announcement", { method: "DELETE" })
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="h-32 w-full flex-col gap-3 rounded-[2rem] border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-orange-500/10 group transition-all duration-300 shadow-sm"
        >
          <Megaphone className="h-6 w-6 text-orange-500 group-hover:scale-110 transition-transform" />
          <span className="font-bold">Post Announcement</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-slate-200 dark:border-white/10 dark:bg-slate-900 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Quick Broadcast</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Send a message to all students immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="content" className="font-semibold ml-1 text-xs uppercase tracking-widest text-slate-400">
              Your Message
            </Label>
            <Textarea
              id="content"
              placeholder="What would you like to tell your students today?"
              className="min-h-[180px] rounded-2xl border-slate-200 dark:border-white/10 dark:bg-slate-950 focus-visible:ring-orange-500 resize-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <p className="text-[10px] text-slate-400 text-right px-1">
              Visible to all active students
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-row gap-3 sm:justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDelete}
            disabled={loading}
            className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl px-4"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
          
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !content.trim()}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-8 shadow-[0_0_15px_rgba(234,88,12,0.3)]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Post Now"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}