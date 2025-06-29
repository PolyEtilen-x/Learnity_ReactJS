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
      <div className="text-2xl font-bold mb-6 text-center" style={{color: isDarkMode? "fff" : "000"}}>Cài đặt Pomodoro</div>

    {(["workMinutes", "shortBreakMinutes", "longBreakMinutes"] as const).map(
    (key: keyof PomodoroSettings) => (
        <div key={key} className="mb-4" style={{fontWeight:"normal",fontSize: 15, color: isDarkMode ? "#000000" : "#ffffff",}}>
        <label className="block font-medium mb-1" style={{fontWeight:"bold",fontSize: 15, color: isDarkMode ? "#000000" : "#ffffff",}}>
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
            style={{color: isDarkMode ? "#000000" : "#ffffff"}}
        />
        </div>
    )
    )}


      <div className="flex justify-between mt-8">
        <button
          onClick={handleSave}
          className="px-6 py-2 rounded hover:bg-blue-600"
          style={{
            backgroundColor: isDarkMode ? "#C0C0C0" : "#F0F0F0",
            color: isDarkMode ? "#ffffff" : "#000000",}}
        >
          Lưu
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-2 rounded hover:bg-gray-400"
          style={{
            backgroundColor: isDarkMode ? "#C0C0C0" : "#F0F0F0",
            color: isDarkMode ? "#ffffff" : "#000000",}}
        >
          Đặt lại
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 rounded hover:bg-red-500"
          style={{
            backgroundColor: isDarkMode ? "#C0C0C0" : "#F0F0F0",
            color: isDarkMode ? "#ffffff" : "#000000",}}
        >
          Hủy
        </button>
      </div>
    </div>
  );
}
