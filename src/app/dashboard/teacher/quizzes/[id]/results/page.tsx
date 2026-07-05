import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MockTestResults({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const attempts = await prisma.quizAttempt.findMany({
    where: { quizId: id },
    include: { student: true },
    orderBy: { score: 'desc' } // Leaderboard style
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Mock Test Results</h1>
      
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">Score</th>
                <th className="p-4">Tab Switches</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => {
                const rawAns = (attempt.answers as any) || {}
                const switchCount = rawAns?._metadata?.tabSwitchCount ?? 0

                return (
                  <tr key={attempt.id} className="border-b hover:bg-slate-50">
                    <td className="p-4 font-medium">{attempt.student.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md font-bold">
                        {attempt.score}
                      </span>
                    </td>
                    <td className="p-4">
                      {switchCount > 0 ? (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full font-extrabold text-xs inline-flex items-center gap-1 border border-red-200">
                          ⚠ {switchCount} warning{switchCount > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">None</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(attempt.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}