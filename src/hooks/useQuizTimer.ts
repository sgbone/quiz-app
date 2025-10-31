import { useState, useEffect, useRef } from "react";

export const useQuizTimer = (isRunning: boolean) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const intervalRef = useRef<number | NodeJS.Timeout | null>(null);

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    if (isRunning) {
      setTimeElapsed(0);
      intervalRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      stopTimer();
    }
    return stopTimer;
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return { timeElapsed, formattedTime: formatTime(timeElapsed), stopTimer };
};
