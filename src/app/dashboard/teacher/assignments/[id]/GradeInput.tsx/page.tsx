"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, Loader2, Save, AlertCircle } from "lucide-react"

export default function GradeInput({ 
  submissionId, 
  currentGrade 
}: { 
  submissionId: string, 
  currentGrade: number | null 
}) {
  const [grade, setGrade] = useState(currentGrade?.toString() || "");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSave = async () => {
    if (grade === currentGrade?.toString() && status !== "error") return;
    
    setLoading(true);
    setStatus("idle");

    try {
      const res = await fetch(`/api/teacher/submissions/${submissionId}/grade`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: parseInt(grade) }), 
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
      }
    } catch (e) {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative group">
        <Input 
          type="number" 
          value={grade} 
          placeholder="0-100"
          onChange={(e) => setGrade(e.target.value)}
          className={`h-9 w-20 text-center font-bold transition-all ${
            status === "success" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : 
            status === "error" ? "border-red-500 bg-red-50" : "border-slate-200"
          }`}
        />
      </div>

      <Button 
        size="sm" 
        variant={status === "success" ? "ghost" : "outline"}
        onClick={handleSave}
        disabled={loading || grade === currentGrade?.toString()}
        className={`h-9 px-2 transition-all ${status === "success" ? "text-emerald-600" : ""}`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : status === "success" ? (
          <Check className="h-4 w-4" />
        ) : status === "error" ? (
          <AlertCircle className="h-4 w-4 text-red-500" />
        ) : (
          <Save className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}