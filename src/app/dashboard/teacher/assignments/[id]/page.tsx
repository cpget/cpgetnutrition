import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, User, Calendar as CalendarIcon, FileText } from "lucide-react";
import GradeInput from "./GradeInput.tsx/page"; 

export default async function AssignmentReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session || session.user.role !== "TEACHER") redirect("/");

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      submissions: {
        include: { student: true },
        orderBy: { submittedAt: 'desc' }
      }
    }
  });

  if (!assignment) notFound();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Assignment Summary Header */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="border-l-4 border-indigo-600">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold text-slate-900">{assignment.title}</CardTitle>
                <CardDescription className="text-slate-500 max-w-2xl italic">
                  {assignment.description}
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-slate-50">
                {assignment.submissions.length} Submissions
              </Badge>
            </div>
          </CardHeader>
        </div>
      </Card>

      {/* Submissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-bold text-slate-700"><User className="inline h-4 w-4 mr-2" />Student</TableHead>
              <TableHead className="font-bold text-slate-700"><FileText className="inline h-4 w-4 mr-2" />Work</TableHead>
              <TableHead className="font-bold text-slate-700"><CalendarIcon className="inline h-4 w-4 mr-2" />Submitted</TableHead>
              <TableHead className="text-right font-bold text-slate-700">Grade (0-100)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignment.submissions.map((sub) => (
              <TableRow key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-semibold text-slate-900">
                  {sub.student.name}
                  <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">{sub.student.email}</p>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="h-8 gap-2 text-indigo-600 border-indigo-100 hover:bg-indigo-50" asChild>
                    <a href={sub.content} target="_blank" rel="noreferrer">
                      Open Document <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {new Date(sub.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </TableCell>
                <TableCell className="flex justify-end">
                  <GradeInput 
                    submissionId={sub.id} 
                    currentGrade={sub.grade} 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {assignment.submissions.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 font-medium">No students have submitted this assignment yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}