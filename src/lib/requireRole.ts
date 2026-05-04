import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function requireRole(role: "TEACHER" | "STUDENT") {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== role) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
      session: null,
    }
  }

  return {
    error: null,
    session,
  }
}