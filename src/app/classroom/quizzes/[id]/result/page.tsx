import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";

export default async function QuizResultPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) redirect("/");

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: true,
      attempts: {
        where: { studentId: session.user.id },
        orderBy: { submittedAt: 'desc' },
        take: 1
      }
    }
  });

  if (!quiz || quiz.attempts.length === 0) notFound();

  const attempt = quiz.attempts[0];
  const scorePercentage = (attempt.score / quiz.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <Link href="/classroom/quizzes">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes
        </Button>
      </Link>

      {/* Score Header */}
      <Card className="text-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl">
        <CardContent className="pt-10 pb-10">
          <Trophy className="mx-auto h-16 w-16 mb-4 text-yellow-400" />
          <h1 className="text-4xl font-extrabold mb-2">Quiz Completed!</h1>
          <p className="text-blue-100 mb-6 text-lg">You scored {attempt.score} out of {quiz.questions.length}</p>
          <div className="inline-block px-6 py-2 bg-white/20 rounded-full text-2xl font-bold backdrop-blur-sm">
            {scorePercentage.toFixed(0)}%
          </div>
        </CardContent>
      </Card>

      {/* Questions Review */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Review Answers</h2>
        {quiz.questions.map((q, idx) => (
          <Card key={q.id} className="overflow-hidden border-l-4 border-l-slate-200">
            <CardHeader className="bg-slate-50/50 py-4">
              <CardTitle className="text-base font-semibold">
                {idx + 1}. {q.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                const isCorrect = q.answer === letter;
                // Note: To show "Your Answer", we would need to store student selections in DB. 
                // For now, we highlight the correct one.
                return (
                  <div 
                    key={letter}
                    className={`flex items-center gap-3 p-3 rounded-md border text-sm ${
                      isCorrect 
                        ? "bg-green-50 border-green-200 text-green-800" 
                        : "bg-white border-slate-100 text-slate-500"
                    }`}
                  >
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${
                      isCorrect ? "bg-green-500 text-white" : "bg-slate-100"
                    }`}>
                      {letter}
                    </span>
                    {q[`option${letter}` as keyof typeof q]}
                    {isCorrect && <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" />}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}