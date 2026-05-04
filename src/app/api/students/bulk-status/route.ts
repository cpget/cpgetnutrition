import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/requireRole"

export async function PATCH(req: Request) {
  const { error } = await requireRole("TEACHER")
  if (error) return error

  const { ids, isApproved } = await req.json()

  // Validate IDs
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: "Invalid request: ids required" },
      { status: 400 }
    )
  }

  if (!ids.every((id) => typeof id === "string")) {
    return NextResponse.json(
      { error: "Invalid ID format" },
      { status: 400 }
    )
  }

  // Validate isApproved
  if (typeof isApproved !== "boolean") {
    return NextResponse.json(
      { error: "isApproved must be boolean" },
      { status: 400 }
    )
  }

  const result = await prisma.user.updateMany({
    where: {
      id: { in: ids },
      role: "STUDENT",
    },
    data: { isApproved },
  })

  return NextResponse.json({
    success: true,
    updatedCount: result.count,
  })
}