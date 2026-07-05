import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowLeft, Trophy, Percent } from "lucide-react";
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
  const scorePercentage = Math.round((attempt.score / quiz.questions.length) * 100);

  // Safely extract student selections from the database record
  // Handles both string-only answers and detailed object answers
  const rawAnswers = (attempt.answers as Record<string, any>) || {};
  const studentSelections: Record<string, string> = {};
  const markedReviewSelections: Record<string, boolean> = {};

  Object.entries(rawAnswers).forEach(([qId, val]) => {
    if (val && typeof val === "object" && "selectedAnswer" in val) {
      studentSelections[qId] = val.selectedAnswer || "";
      markedReviewSelections[qId] = !!val.isMarkedForReview;
    } else {
      studentSelections[qId] = typeof val === "string" ? val : "";
      markedReviewSelections[qId] = false;
    }
  });

  // Retrieve ranking details only if this is the active weekly mock test
  let rank: number | null = null;
  let totalParticipants = 0;

  if (quiz.isActive) {
    const allAttempts = await prisma.quizAttempt.findMany({
      where: { quizId: id },
      select: {
        studentId: true,
        score: true,
        submittedAt: true,
      }
    });

    allAttempts.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    });

    const attemptIndex = allAttempts.findIndex(a => a.studentId === session.user.id);
    if (attemptIndex !== -1) {
      rank = attemptIndex + 1;
    }
    totalParticipants = allAttempts.length;
  }

  let topPercentage = 100;
  if (quiz.isActive && rank !== null && totalParticipants > 0) {
    const percentile = ((totalParticipants - rank) / totalParticipants) * 100;
    topPercentage = Math.max(1, Math.round(100 - percentile));
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
      <Link href="/classroom/quizzes">
        <Button variant="ghost" size="sm" className="hover:bg-slate-100">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes
        </Button>
      </Link>

      {/* Modern Dashboard-Style Hero Score Header */}
      <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white relative">

        {quiz.isActive && rank !== null && (
          <div className="bg-white/5 border-t border-white/10 px-8 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left text-sm font-medium">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-yellow-400">
              🏆 Current Rank: <span className="font-bold text-white">#{rank}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-300">
              👥 Participants: <span className="font-bold text-white">{totalParticipants}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-end gap-2 text-teal-400">
              📈 Standing: <span className="font-bold text-white">Top {topPercentage}%</span>
            </div>
          </div>
        )}
      </Card>

      {/* Questions Review */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Review Answers</h2>

        {quiz.questions.map((q, idx) => {
          const studentSelection = studentSelections[q.id];
          const isMarkedForReview = !!markedReviewSelections[q.id];
          const isCorrectSubmission = studentSelection === q.answer;

          return (
            <Card
              key={q.id}
              className={`overflow-hidden border-l-4 transition-all duration-200 ${!studentSelection
                  ? "border-l-slate-300"
                  : isCorrectSubmission
                    ? "border-l-emerald-500 shadow-sm"
                    : "border-l-rose-500 shadow-sm"
                }`}
            >
              <CardHeader className="bg-slate-50/60 py-4">
                <CardTitle className="text-base font-semibold leading-relaxed text-slate-800 flex items-start gap-2">
                  <span className="text-slate-400 font-mono">{idx + 1}.</span>
                  <span className="flex-1">{q.question}</span>
                  {isMarkedForReview && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 border border-amber-200">
                      Marked for Review
                    </span>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                  const isSystemCorrectOption = q.answer === letter;
                  const isOptionSelectedByStudent = studentSelection === letter;

                  // Define standard UI values
                  let cardStyle = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50/50";
                  let badgeStyle = "bg-slate-100 text-slate-600";
                  let statusLabel = null;

                  // Apply highlighted status values dynamically
                  if (isSystemCorrectOption) {
                    cardStyle = "bg-emerald-50/70 border-emerald-300 text-emerald-900 font-medium";
                    badgeStyle = "bg-emerald-500 text-white";
                    statusLabel = (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-100/50 px-2 py-0.5 rounded-md ml-auto">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Correct Answer
                      </span>
                    );
                  } else if (isOptionSelectedByStudent && !isSystemCorrectOption) {
                    cardStyle = "bg-rose-50 border-rose-200 text-rose-900";
                    badgeStyle = "bg-rose-500 text-white";
                    statusLabel = (
                      <span className="text-xs font-semibold text-rose-600 flex items-center gap-1 bg-rose-100/50 px-2 py-0.5 rounded-md ml-auto">
                        <XCircle className="h-3.5 w-3.5" /> Your Choice
                      </span>
                    );
                  }

                  return (
                    <div
                      key={letter}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm transition-colors ${cardStyle}`}
                    >
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold shrink-0 ${badgeStyle}`}>
                        {letter}
                      </span>
                      <span className="pr-2 break-words">{q[`option${letter}` as keyof typeof q]}</span>
                      {statusLabel}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}