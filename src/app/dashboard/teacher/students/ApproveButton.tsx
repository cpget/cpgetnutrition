"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function ApproveButton({
  userId,
  isApproved,
}: {
  userId: string
  isApproved: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    try {
      setLoading(true)

      await fetch(`/api/students/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isApproved: !isApproved,
        }),
      })

      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-2 rounded ${
        isApproved
          ? "bg-red-500 text-white"
          : "bg-green-600 text-white"
      }`}
    >
      {loading
        ? "Updating..."
        : isApproved
        ? "Unapprove"
        : "Approve"}
    </button>
  )
}
