"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Student = {
  id: string
  name: string
  email: string
  isApproved: boolean
}

export default function StudentsTable({ students }: { students: Student[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const bulkUpdateStatus = async (isApproved: boolean) => {
    if (selected.length === 0) return

    try {
      setLoading(true)

      await fetch("/api/students/bulk-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selected,
          isApproved,
        }),
      })

      setSelected([])
      router.refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">

      {/* Bulk Action Buttons */}
      {selected.length > 0 && (
        <div className="flex gap-4">
          <button
            onClick={() => bulkUpdateStatus(true)}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            {loading
              ? "Updating..."
              : `Approve ${selected.length} Selected`}
          </button>

          <button
            onClick={() => bulkUpdateStatus(false)}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            {loading
              ? "Updating..."
              : `Unapprove ${selected.length} Selected`}
          </button>
        </div>
      )}

      {/* Students List */}
      <div className="border rounded divide-y">
        {students.map(student => (
          <div
            key={student.id}
            className="p-4 flex justify-between items-center"
          >
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selected.includes(student.id)}
                onChange={() => toggleSelect(student.id)}
              />

              <div>
                <p className="font-medium">{student.name}</p>
                <p className="text-sm text-muted-foreground">
                  {student.email}
                </p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded text-sm ${
                student.isApproved
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {student.isApproved ? "Approved" : "Pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}