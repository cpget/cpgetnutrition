"use client";

import { useEffect, useState } from "react";

interface QuizTimerProps {
  durationInMinutes: number;
  onTimeUp: () => void;
}

export const QuizTimer = ({ durationInMinutes, onTimeUp }: QuizTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(durationInMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={`p-4 rounded-lg font-mono text-xl font-bold border-2 ${
      timeLeft < 60 ? "bg-red-100 text-red-600 border-red-500 animate-pulse" : "bg-slate-100 text-slate-700 border-slate-300"
    }`}>
      ⏱️ {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
    </div>
  );
};