import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import QuizCard from "./QuizCard"; 

export default async function TeacherQuizzesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "TEACHER") redirect("/");

  const quizzes = await prisma.quiz.findMany({
    where: { teacherId: session.user.id },
    include: { _count: { select: { questions: true, attempts: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mock Tests</h1>
          <p className="text-muted-foreground">Manage and monitor student performance.</p>
        </div>
        <Link href="/dashboard/teacher/quizzes/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" /> New Mock Test
          </Button>
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl bg-slate-50">
          <p className="text-muted-foreground">No mock tests created yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
}