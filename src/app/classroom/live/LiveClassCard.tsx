"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Link as LinkIcon, MonitorPlay } from "lucide-react"

interface LiveClassProps {
  cls: {
    id: string
    topic: string
    meetingLink: string
  }
}

export default function LiveClassCard({ cls }: LiveClassProps) {
  return (
    <Card className="overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all bg-white rounded-xl">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center p-6 gap-6">
          
          {/* Visual Indicator */}
          <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <MonitorPlay className="h-6 w-6" />
          </div>

          {/* Topic Section */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-red-600 rounded-full animate-pulse" />
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {cls.topic}
              </h3>
            </div>
            
            {/* The Link Box */}
            <div className="flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100 max-w-sm">
              <LinkIcon className="h-3 w-3 shrink-0" />
              <p className="text-[11px] font-medium truncate italic">
                {cls.meetingLink}
              </p>
            </div>
          </div>

          {/* The Join Button */}
          <div className="flex items-center justify-end sm:border-l sm:pl-6 border-slate-100 shrink-0">
            <a 
              href={cls.meetingLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button 
                size="lg"
                className="w-full sm:w-auto font-bold gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100 transition-all active:scale-95"
              >
                Join Class
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}