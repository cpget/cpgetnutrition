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
import { Loader2 } from "lucide-react"

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
        <Button>Login / Signup</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {view === "pending" ? "Access Pending" : "Welcome back"}
          </DialogTitle>
          <DialogDescription>
            {view === "pending"
              ? "Your account is waiting for admin approval."
              : "Login quickly and securely with Google."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          {view === "login" ? (
            <Button onClick={handleGoogleLogin} disabled={loading} className="w-full h-11">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? "Connecting..." : "Continue with Google"}
            </Button>
          ) : (
            <Button onClick={handleSignOut} variant="secondary" disabled={loading} className="w-full h-11 border">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sign Out / Back
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}