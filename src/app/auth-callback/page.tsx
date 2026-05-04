"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AuthCallback() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.role === "TEACHER") {
        router.push("/dashboard/teacher")
      } else {
        router.push("/classroom")
      }
    } else if (status === "unauthenticated") {
      router.push("/?error=AccessDenied")
    }
  }, [status, session, router])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <h2 className="text-xl font-semibold text-slate-700">Verifying your account...</h2>
        <p className="text-sm text-slate-500">Checking permissions.</p>
      </div>
    </div>
  )
}
