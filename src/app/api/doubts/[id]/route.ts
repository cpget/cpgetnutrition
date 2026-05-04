import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

type Params = Promise<{ id: string }>

export async function PATCH(req: Request, ctx: { params: Params }) {
  try {
    const session = await getServerSession(authOptions)

    // 🔐 Only teacher allowed
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await ctx.params
    const { answer } = await req.json()

    if (!answer || typeof answer !== "string" || !answer.trim()) {
      return NextResponse.json({ error: "Answer is required" }, { status: 400 })
    }

    const doubt = await prisma.doubt.findUnique({
      where: { id },
    })

    if (!doubt) {
      return NextResponse.json({ error: "Doubt not found" }, { status: 404 })
    }

    await prisma.doubt.update({
      where: { id },
      data: {
        answer: answer.trim(),
        teacherId: session.user.id,
        answeredAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

// ✅ Student can delete ONLY their own doubt
export async function DELETE(_req: Request, ctx: { params: Params }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await ctx.params

  const doubt = await prisma.doubt.findUnique({
    where: { id },
    select: { id: true, studentId: true, answer: true },
  })

  if (!doubt || doubt.studentId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.doubt.delete({ where: { id } })
  return NextResponse.json({ success: true })
}