import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider";
import { AppTextStyles, AppBackgroundStyles } from "../theme/theme";
import learnityImg from "../assets/learnity.png";


export default function Intro() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <div
      className="w-screen h-screen flex flex-col"
      style={{ backgroundColor: AppBackgroundStyles.mainBackground(isDarkMode) }}
    >
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col justify-center items-center px-6 py-10 min-h-full">
          <div className="w-full max-w-md text-center">
            <h1 style={AppTextStyles.title(isDarkMode)}>
              Chào Mừng<br />Đến Với Learnity
            </h1>

            <div className="my-6">
              <img
                src={learnityImg}
                alt="Learnity"
                className="w-[190px] h-[180px] mx-auto object-contain"
              />
            </div>

            <p style={AppTextStyles.body(isDarkMode)}>
              Cộng đồng học tập – Nơi mỗi ý tưởng đều có giá trị.
            </p>

            <div className="mt-10 space-y-4">
              <button
                className="w-full py-3 rounded-lg text-white font-semibold"
                style={{ backgroundColor: "#1A3C34" }}
                onClick={() => navigate("/login")}
              >
                Đăng nhập
              </button>

              <button
                className="w-full py-3 rounded-lg border border-white bg-white text-black font-semibold"
                onClick={() => navigate("/signup")}
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
