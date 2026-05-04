"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function DeleteAssignmentButton({ id }: { id: string }) {
  const router = useRouter()

  async function onDelete() {
    const ok = confirm("Delete this assignment?")
    if (!ok) return

    const res = await fetch(`/api/teacher/assignments/${id}`, {
      method: "DELETE",
    })

    if (res.ok) router.refresh()
    else alert("Failed to delete")
  }

  return (
    <Button variant="destructive" size="sm" onClick={onDelete}>
      Delete
    </Button>
  )
}