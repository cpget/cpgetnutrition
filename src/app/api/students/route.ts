import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { requireRole } from "@/lib/requireRole"

export async function GET() {
  const { error } = await requireRole("TEACHER")
  if (error) return error

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(students)
}