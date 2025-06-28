import { useEffect, useState, useRef } from "react";
import { AppBackgroundStyles, AppTextStyles } from "../../theme/theme";
import { useTheme } from "../../theme/ThemeProvider";
import {
  loadPomodoroSettings,
  savePomodoroSettings,
  type PomodoroSettings,
} from "../../services/pomodoroApi";
import { Settings, Pause, Play, RotateCcw } from "lucide-react";
import PomodoroSettingsPage from "../settings/PomodoroSettings";

export default function PomodoroPage() {
  const { isDarkMode } = useTheme();
  const [settings, setSettings] = useState<PomodoroSettings | null>(null);
  const [phase, setPhase] = useState<"work" | "shortBreak" | "longBreak">("work");
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadPomodoroSettings().then((data) => {
      setSettings(data);
      setTimeLeft(data.workMinutes * 60);
    });
  }, []);

  // Countdown handler
  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          switchPhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [isRunning]);

  const switchPhase = () => {
    setIsRunning(false);

    if (!settings) return;

    if (phase === "work") {
        const next = completedSessions < 3 ? "shortBreak" : "longBreak";
        setCompletedSessions((prev) => (next === "longBreak" ? 0 : prev + 1));
        setPhase(next);
        const nextKey = `${next}Minutes` as keyof PomodoroSettings;
        setTimeLeft((Number(settings[nextKey]) ?? 0) * 60);

    } else {
        setPhase("work");
        setTimeLeft(settings.workMinutes * 60);
        }
  };

  const reset = () => {
    if (!settings) return;
    setIsRunning(false);
    setPhase("work");
    setCompletedSessions(0);
    setTimeLeft(settings.workMinutes * 60);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!settings) return <div className="p-6 text-center">Đang tải cài đặt Pomodoro...</div>;

  return (
    <div
      className="min-h-screen p-6 flex flex-col items-center justify-center"
      style={{ backgroundColor: AppBackgroundStyles.mainBackground(isDarkMode) }}
    >
        <h1
        className="text-2xl font-bold mb-4"
        style={{ color: isDarkMode ? "#ffffff" : "#000000" }}
        >
        {phase === "work" ? "Làm việc" : phase === "shortBreak" ? "Nghỉ ngắn" : "Nghỉ dài"}
      </h1>

      <div className="relative w-64 h-64 flex items-center justify-center rounded-full border-[12px] border-teal-500 text-4xl font-bold text-black bg-white dark:bg-gray-800">
        {formatTime(timeLeft)}
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => setIsRunning((prev) => !prev)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-black rounded shadow"
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
          {isRunning ? "Tạm dừng" : "Bắt đầu"}
        </button>

        <button
          onClick={reset}
          className="p-2 bg-gray-300 dark:bg-gray-700 rounded-full"
        >
          <RotateCcw size={20} />
        </button>

        <button
          onClick={() => setShowSettings(true)}
          className="p-2 bg-gray-300 dark:bg-gray-700 rounded-full"
        >
          <Settings size={20} />
        </button>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <PomodoroSettingsPage
            onClose={() => {
              setShowSettings(false);
              loadPomodoroSettings().then((data) => {
                setSettings(data);
                setTimeLeft(data.workMinutes * 60);
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
