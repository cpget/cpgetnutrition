"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3, BarChart2 } from "lucide-react";
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="line-clamp-1">{quiz.title}</CardTitle>
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