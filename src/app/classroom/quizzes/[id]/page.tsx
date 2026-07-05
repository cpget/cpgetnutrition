import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import QuizPlayer from "./QuizPlayer";

export default async function TakeQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) redirect("/login");

  // Fetch quiz including questions AND duration
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: { questions: true },
  });

  if (!quiz) notFound();

  // Check if student has already completed this quiz
  const existingAttempt = await prisma.quizAttempt.findFirst({
    where: { 
      quizId: id, 
      studentId: session.user.id 
    }
  });

  if (existingAttempt) {
    redirect(`/classroom/quizzes/${id}/result`);
  }

  return (
    <QuizPlayer quiz={quiz} duration={quiz.duration} />
  );
}