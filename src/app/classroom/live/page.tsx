import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function StudentLivePage() {
  let liveClass = null
  let errorOccurred = false

  try {
    // Fetch the current single live class record
    liveClass = await prisma.liveClass.findFirst()
  } catch (error) {
    console.error("Failed to fetch live class:", error)
    errorOccurred = true
  }

  return (
    <div className="container max-w-2xl min-h-[60vh] flex flex-col justify-center py-12">
      <div className="space-y-2 mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Live Classroom
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Official portal for ongoing virtual lectures
        </p>
      </div>

      {errorOccurred ? (
        <div className="py-16 text-center border rounded-xl bg-red-50/50 border-red-200">
          <p className="text-sm text-red-600 font-medium tracking-wide">
            Unable to connect to the classroom database. Please try again later.
          </p>
        </div>
      ) : liveClass ? (
        <Card className="border shadow-lg rounded-xl bg-white">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-[0.2em]">
                  Status: Active
                </span>
                <h2 className="text-2xl font-semibold text-slate-800">
                  {liveClass.topic}
                </h2>
              </div>

              <div className="w-full sm:w-auto">
                <a
                  href={liveClass.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    size="lg"
                    className="w-full sm:w-auto px-10 h-12 text-sm font-semibold rounded-md shadow-sm transition-all active:scale-[0.98]"
                  >
                    Join Session
                  </Button>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="py-16 text-center border rounded-xl bg-slate-50/50">
          <p className="text-sm text-slate-400 font-medium tracking-wide">
            No active session found. Please wait for the instructor.
          </p>
        </div>
      )}

      <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <span>University Portal</span>
        <span>IST (GMT+5:30)</span>
      </div>
    </div>
  )
}
