import Navbar from "../components/Navbar";
import { useTheme } from "../theme/ThemeProvider";
import { AppColors, AppTextStyles } from "../theme/theme";
import { Outlet } from "react-router-dom";

export default function Home() {
  const { isDarkMode } = useTheme();

  return (
    <div
    className="flex w-screen h-screen overflow-hidden"
      style={{
        backgroundColor: isDarkMode
          ? AppColors.darkBackground
          : AppColors.background,
      }}
    >
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

    </div>
  );
}


