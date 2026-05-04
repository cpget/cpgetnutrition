"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function BulkApprove({
  students,
}: {
  students: any[]
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    )
  }

  const handleBulkApprove = async () => {
    setLoading(true)

    await fetch("/api/students/bulk-approve", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected }),
    })

    router.refresh()
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleBulkApprove}
        disabled={loading || selected.length === 0}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        {loading
          ? "Approving..."
          : `Approve Selected (${selected.length})`}
      </button>

      <div className="border rounded divide-y">
        {students.map((student) => (
          <div
            key={student.id}
            className="flex justify-between p-4 items-center"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                onChange={() => toggleSelect(student.id)}
              />
              <div>
                <p className="font-medium">
                  {student.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {student.email}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}