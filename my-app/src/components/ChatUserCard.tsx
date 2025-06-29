import React from "react";
import { type AppUser } from "../models/AppUser";
import { is } from "date-fns/locale";
import { useTheme } from "../theme/ThemeProvider";
import { AppColors } from "../theme/theme";

interface Props {
  user: AppUser;
  onClick: () => void;
}
const ChatUserCard: React.FC<Props> = ({ user, onClick }) => {
    const { isDarkMode } = useTheme();

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 cursor-pointer border-b"
      onClick={onClick}
    >
      <img
        src={user.avatarUrl || "/default-avatar.png"}
        alt="avatar"
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex-1">
        <p className="font-semibold text-sm" style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}>
          {user.name}
        </p>
        <p className="text-xs " style={{ color: isDarkMode ? "#C0C0C0" : "#696969" }}>
          {user.isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
        </p>
      </div>
    </div>
  );
};

export default ChatUserCard;