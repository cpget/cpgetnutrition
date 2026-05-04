import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/requireRole"

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireRole("TEACHER")
  if (error) return error

  const { id } = await context.params
  const { isApproved } = await req.json()

  if (typeof isApproved !== "boolean") {
    return NextResponse.json(
      { error: "Invalid approval value" },
      { status: 400 }
    )
  }

  const updated = await prisma.user.updateMany({
    where: {
      id,
      role: "STUDENT",
    },
    data: { isApproved },
  })

  if (updated.count === 0) {
    return NextResponse.json(
      { error: "Student not found" },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true })
}