import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import EditMockTestForm from "./EditMockTestForm";

export default async function EditMockTestPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session || session.user.role !== "TEACHER") redirect("/");

  // Fetch the existing Mock Test data
  const mockTest = await prisma.quiz.findUnique({
    where: { id },
    include: { questions: true },
  });

  if (!mockTest || mockTest.teacherId !== session.user.id) notFound();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Mock Test</h1>
        <p className="text-muted-foreground">Modify questions, timing, or description.</p>
      </div>
      
      <EditMockTestForm initialData={mockTest} />
    </div>
  );
}