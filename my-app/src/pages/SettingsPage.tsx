import { useTheme } from "../theme/ThemeProvider";
import { AppBackgroundStyles } from "../theme/theme";
import { Clock, StickyNote, HelpCircle, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();


  const settings = [
    {
      title: "Pomodoro",
      icon: <Clock className="w-6 h-6" />,
      onClick: () => navigate("/pomodoro"),
    },
    {
      title: "Ghi chú",
      icon: <StickyNote className="w-6 h-6" />,
      onClick: () => alert("Đi tới Ghi chú"),
    },
    {
      title: "Trợ giúp",
      icon: <HelpCircle className="w-6 h-6" />,
      onClick: () => alert("Đi tới Trợ giúp"),
    },
    {
      title: isDarkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối",
      icon: <Moon className="w-6 h-6" />,
      onClick: toggleTheme,
    },
  ];

  return (
    <div
      className="min-h-screen px-6 py-8"
      style={{ backgroundColor: AppBackgroundStyles.mainBackground(isDarkMode), marginLeft: "400px" }} 
    >
      <h1 className="text-2xl font-bold mb-6">Cài đặt</h1>
      <div className="space-y-4">
        {settings.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="flex items-center justify-between w-full p-4 rounded-lg shadow border bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <div className="flex items-center gap-4">
              {item.icon}
              <span className="text-lg font-medium">
                {item.title}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
