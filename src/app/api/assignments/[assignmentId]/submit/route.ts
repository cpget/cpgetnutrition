import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { assignmentId } = await params;

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // We use req.json() because we are sending a simple string from the frontend
    const body = await req.json();
    const content = body.content; // This is the Drive URL

    if (!content) {
      return NextResponse.json({ error: "Link is required" }, { status: 400 });
    }

    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: assignmentId,
          studentId: session.user.id,
        },
      },
      update: {
        content: content, // Saving the Drive URL to the 'content' column
        submittedAt: new Date(),
      },
      create: {
        assignmentId: assignmentId,
        studentId: session.user.id,
        content: content,
      },
    });

    return NextResponse.json(submission);
  } catch (error: any) {
    console.error("ASSIGNMENT_SUBMIT_ERROR:", error);
    return NextResponse.json({ error: "Failed to submit link" }, { status: 500 });
  }
}