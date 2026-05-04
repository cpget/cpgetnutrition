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
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{quiz.title}</h1>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-semibold">
            {quiz.duration} Minutes
          </div>
        </div>
        <p className="text-muted-foreground">{quiz.description || "No instructions provided."}</p>
      </div>
      
      {/* Pass the quiz data and duration to the Client Component */}
      <QuizPlayer quiz={quiz} duration={quiz.duration} />
    </div>
  );
}