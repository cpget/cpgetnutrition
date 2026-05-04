"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Inbox, Loader2, ChevronLeft } from "lucide-react"

export default function AuthDialog() {
  const [view, setView] = useState("login") // login | pending
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
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

  // --- 1. LOGIN HANDLER ---
  const handleLogin = async (e?: React.FormEvent<HTMLFormElement> | React.MouseEvent) => {
    if (e && 'preventDefault' in e) e.preventDefault(); 
    setLoading(true); 
    setError(null);
    
    // Trigger Google login. NextAuth handles the OAuth redirect.
    await signIn("google", { callbackUrl: "/classroom" });
  };

  // --- VIEW: PENDING APPROVAL ---
  if (view === "pending") {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
        <div className="bg-blue-100 p-5 rounded-full">
          <Inbox className="h-12 w-12 text-blue-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Access Pending</h2>
          <p className="text-slate-500 text-sm px-6">
            Your account is waiting for admin approval
          </p>
        </div>
        <div className="w-full space-y-4 px-4">
          <Button variant="ghost" onClick={() => setView("login")} className="w-full text-slate-500 text-xs">
            <ChevronLeft className="h-3 w-3 mr-1" /> Back to Login
          </Button>
        </div>
      </div>
    )
  }

  // --- MAIN VIEW: LOGIN ---
  return (
    <div className="space-y-5 py-2">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {view === "login" && (
        <form onSubmit={(e) => handleLogin(e)} className="space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-sm text-slate-500">Access your nutrition classroom.</p>
          </div>
          <div className="space-y-4 pt-2">
            <Button 
              type="button" 
              onClick={handleLogin} 
              className="w-full h-11" 
              disabled={loading}
            >
               {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
               {loading ? "Connecting..." : "Continue with Google"}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}