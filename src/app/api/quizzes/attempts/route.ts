import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const myAttempts = await prisma.quizAttempt.findMany({
      where: { studentId: session.user.id },
      include: {
        quiz: { select: { title: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(myAttempts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attempts" }, { status: 500 });
  }
}