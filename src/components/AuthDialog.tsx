"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { signIn, signOut } from "next-auth/react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Loader2, ArrowRight } from "lucide-react"

export default function AuthDialog() {
  const [view, setView] = useState<"login" | "pending">("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams?.get("error")
    if (errorParam) {
      if (
        errorParam.includes("Account not approved by admin") ||
        errorParam.includes("AccessDenied")
      ) {
        setView("pending")
        setError(null)
      } else {
        setView("login")
        if (errorParam === "OAuthAccountNotLinked") {
          setError("Email already in use with a different provider.")
        } else {
          setError("An error occurred during sign in. Please try again.")
        }
      }
    }
  }, [searchParams])

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      await signIn("google", { callbackUrl: "/auth-callback" })
    } catch (err: any) {
      setError(err.message || "Failed to sign in")
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    await signOut({ redirect: false })
    setView("login")
    setLoading(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-lg font-bold transition-all shadow-xl shadow-blue-500/25 flex items-center gap-2 cursor-pointer">
          Join the Next Batch
          <ArrowRight className="h-5 w-5" />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            {view === "pending" ? "Access Pending" : "Join the Next Batch"}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {view === "pending"
              ? "Your account is waiting for admin approval."
              : "Continue with Google to access classes, mock tests, and doubt sessions."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          {view === "login" ? (
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              variant="outline"
              className="w-full h-12 font-semibold border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg
                    className="mr-2 h-5 w-5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.56-2.77c-.99.66-2.26 1.05-3.72 1.05-2.86 0-5.28-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.85 14.1a6.61 6.61 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.67-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06L5.85 9.9c.87-2.6 3.29-4.52 6.15-4.52z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleSignOut} variant="secondary" disabled={loading} className="w-full h-11 border cursor-pointer">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sign Out / Back
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}