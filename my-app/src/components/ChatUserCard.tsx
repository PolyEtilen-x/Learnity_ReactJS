import React from "react";
import { type AppUser } from "../models/AppUser";

interface Props {
  user: AppUser;
  onClick: () => void;
}

const ChatUserCard: React.FC<Props> = ({ user, onClick }) => {
  return (
    <div
      className="flex items-center gap-4 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer border-b dark:border-gray-700"
      onClick={onClick}
    >
      <img
        src={user.avatarUrl || "/default-avatar.png"}
        alt="avatar"
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex-1">
        <p className="font-semibold text-sm text-black dark:text-white">
          {user.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {user.isOnline ? "Đang hoạt động" : "Ngoại tuyến"}
        </p>
      </div>
    </div>
  );
};

export default ChatUserCard;