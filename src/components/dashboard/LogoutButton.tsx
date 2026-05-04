"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LogoutButton() {
  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="w-4 h-4" />
      Logout
    </Button>
  )
}