"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3, BarChart2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TeacherActivateButton from "../TeacherActivateButton";

export default function QuizCard({ 
  quiz, 
  currentActiveQuiz 
}: { 
  quiz: any; 
  currentActiveQuiz: any; 
}) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure? This will delete the Mock Test and all results.")) return;

    try {
      const res = await fetch(`/api/teacher/quizzes/${quiz.id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      alert("Error deleting test");
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow relative ${quiz.isActive ? 'border-2 border-emerald-500 bg-emerald-50/10' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-lg font-bold pr-2">{quiz.title}</CardTitle>
          <div className="flex flex-col gap-1.5 items-end shrink-0">
            {quiz.isDraft && (
              <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/30 hover:bg-slate-500/15 font-bold uppercase text-[9px] select-none">
                📝 Draft
              </Badge>
            )}
            {quiz.isActive && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/15 font-bold uppercase text-[9px] select-none">
                🟢 Active
              </Badge>
            )}

          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-tight">
          <span>{quiz._count.questions} Questions</span>
          <span>{quiz._count.attempts} Submissions</span>
        </div>
        
        <div className="grid grid-cols-3 gap-1">
          <Button variant="outline" size="sm" asChild className="px-1 text-[11px] font-bold">
            <Link href={`/dashboard/teacher/quizzes/${quiz.id}`}>
              <BarChart2 className="mr-1 h-3.5 w-3.5 shrink-0" /> Results
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="px-1 text-[11px] font-bold">
            <Link href={`/dashboard/teacher/quizzes/${quiz.id}/edit`}>
              <Eye className="mr-1 h-3.5 w-3.5 shrink-0" /> View
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="px-1 text-[11px] font-bold">
            <Link href={`/dashboard/teacher/quizzes/${quiz.id}/edit?edit=true`}>
              <Edit3 className="mr-1 h-3.5 w-3.5 shrink-0" /> Edit
            </Link>
          </Button>
        </div>

        <TeacherActivateButton
          quizId={quiz.id}
          title={quiz.title}
          isActive={quiz.isActive}
          questionsCount={quiz._count.questions}
          currentActiveQuiz={currentActiveQuiz}
          variant="card"
        />

        <Button 
          variant="destructive" 
          size="sm" 
          className="w-full cursor-pointer" 
          onClick={handleDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete Mock Test
        </Button>
      </CardContent>
    </Card>
  );
}