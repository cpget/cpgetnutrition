"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3, BarChart2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function QuizCard({ quiz }: { quiz: any }) {
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

  const handleActivate = async () => {
    try {
      const res = await fetch(`/api/teacher/quizzes/${quiz.id}/activate`, { method: "POST" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Activation failed");
      }
    } catch (err) {
      alert("Error activating test");
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow relative ${quiz.isActive ? 'border-2 border-emerald-500 bg-emerald-50/10' : ''}`}>
      {quiz.isActive && (
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold uppercase text-[9px]">
            Active Weekly
          </Badge>
        </div>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-1 pr-24">{quiz.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-tight">
          <span>{quiz._count.questions} Questions</span>
          <span>{quiz._count.attempts} Submissions</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/teacher/quizzes/${quiz.id}`}>
              <BarChart2 className="mr-2 h-4 w-4" /> Results
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/teacher/quizzes/${quiz.id}/edit`}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
        </div>

        {!quiz.isActive && (
          <Button 
            variant="default" 
            size="sm" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold" 
            onClick={handleActivate}
          >
            Activate as Weekly Test
          </Button>
        )}

        <Button 
          variant="destructive" 
          size="sm" 
          className="w-full" 
          onClick={handleDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete Mock Test
        </Button>
      </CardContent>
    </Card>
  );
}