import { useEffect, useState } from "react";
import { useTheme } from "../../theme/ThemeProvider";
import { AppBackgroundStyles, AppTextStyles } from "../../theme/theme";
import {
  loadPomodoroSettings,
  savePomodoroSettings,
  type PomodoroSettings,
} from "../../services/pomodoroApi";

export default function PomodoroSettingsPage({ onClose }: { onClose: () => void }) {
  const { isDarkMode } = useTheme();
  const [settings, setSettings] = useState<PomodoroSettings>({
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const loaded = await loadPomodoroSettings();
      setSettings(loaded);
      setLoading(false);
    };
    fetch();
  }, []);

  const updateValue = (field: keyof PomodoroSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await savePomodoroSettings(settings);
    onClose();
  };

  const handleReset = () => {
    setSettings({ workMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15 });
  };

  if (loading) return <div className="p-6">Đang tải cài đặt...</div>;

  return (
    <div
      className="max-w-xl mx-auto px-6 py-8 rounded-lg shadow"
      style={{ backgroundColor: AppBackgroundStyles.mainBackground(isDarkMode) }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Cài đặt Pomodoro</h2>

    {(["workMinutes", "shortBreakMinutes", "longBreakMinutes"] as const).map(
    (key: keyof PomodoroSettings) => (
        <div key={key} className="mb-4">
        <label className="block font-medium mb-1">
            {key === "workMinutes"
            ? "Làm việc"
            : key === "shortBreakMinutes"
            ? "Nghỉ ngắn"
            : "Nghỉ dài"}
        </label>
        <input
            type="number"
            value={settings[key] as number}
            min={1}
            max={60}
            onChange={(e) => updateValue(key, parseInt(e.target.value))}
            className="w-full p-2 border rounded"
        />
        </div>
    )
    )}


      <div className="flex justify-between mt-8">
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Lưu
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
        >
          Đặt lại
        </button>
        <button
          onClick={onClose}
          className="bg-red-400 text-white px-6 py-2 rounded hover:bg-red-500"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
