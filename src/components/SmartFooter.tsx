"use client"

import { usePathname } from "next/navigation"
import Footer from "./footer" // Ensure casing matches your file (Footer.tsx)

export default function SmartFooter() {
  const pathname = usePathname()
  
  // Define routes where the footer should be HIDDEN
  const isDashboard = pathname?.startsWith("/dashboard")

  if (isDashboard) return null

  return <footer />
}