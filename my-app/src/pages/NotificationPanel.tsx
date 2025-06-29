import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useTheme } from "../theme/ThemeProvider";
import { AppBackgroundStyles, AppTextStyles } from "../theme/theme";
import clsx from "clsx";
import { is } from "date-fns/locale";

interface NotificationModel {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type?: string;
  isRead: boolean;
}

interface UserInfoModel {
  uid: string;
  avatarUrl?: string;
  username?: string;
  displayName?: string;
}

export default function NotificationPanel({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const [notifications, setNotifications] = useState<NotificationModel[]>([]);
  const [tab, setTab] = useState<string>("all");
  const [avatars, setAvatars] = useState<Record<string, string>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  // Close if clicked outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Fetch notifications in real-time
  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      where("receiverId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          senderId: data.senderId,
          senderName: data.senderName || "Người dùng",
          message: data.message,
          timestamp: data.timestamp?.toDate?.() || new Date(),
          type: data.type,
          isRead: data.isRead ?? false,
        };
      });
      setNotifications(notifs);
      preloadAvatars(notifs.map((n) => n.senderId));
    });
    return () => unsubscribe();
  }, [userId]);

  const preloadAvatars = async (userIds: string[]) => {
    const uniqueIds = Array.from(new Set(userIds));
    const map: Record<string, string> = {};
    await Promise.all(
      uniqueIds.map(async (id) => {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const avatar = docSnap.data().avatarUrl;
          if (avatar) map[id] = avatar;
        }
      })
    );
    setAvatars(map);
  };

  const markAsReadAndHandle = async (notif: NotificationModel) => {
    await updateDoc(doc(db, "notifications", notif.id), {
      isRead: true,
    });

    if (notif.type === "follow") {
      navigate(`/profile/${notif.senderId}`);
    }
  };

  const filteredNotifs =
    tab === "all" ? notifications : notifications.filter((n) => n.type === tab);

  return (
    <div
      ref={panelRef}
      className="fixed top-0 left-[80px] md:left-[80px] h-screen w-[400px] z-50 shadow-xl border-r overflow-y-auto"
      style={{
          backgroundColor: isDarkMode ? "#163B25 " : "#E8F8F6",
          borderColor: isDarkMode ? "#444" : "#e5e5e5",
      }}
    >
      <div className="p-4 border-b" style={{ borderColor: "#000000" }}>
        <h2 style={AppTextStyles.title(isDarkMode)}>Thông báo</h2>
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {[
            { label: "Tất cả", key: "all" },
            { label: "Theo dõi", key: "follow" },
            { label: "Yêu thích", key: "like" },
            { label: "Bình luận", key: "comment" },
            { label: "Chia sẻ", key: "share" },
          ].map((item) => (
            <button
            key={item.key}
            className="px-4 py-1 text-sm rounded-full whitespace-nowrap"
            style={{
                backgroundColor:
                tab === item.key
                    ? AppBackgroundStyles.footerBackground(isDarkMode)
                    : AppBackgroundStyles.mainBackground(isDarkMode),
                color: tab === item.key 
                  ? isDarkMode ?"#000" : "#fff"
                  : isDarkMode ? "#fff" : "#000",
            }}
            onClick={() => setTab(item.key)}
            >
            {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {filteredNotifs.length === 0 ? (
          <p className="text-sm" style={{ color: isDarkMode ? "#fff" : "#000" }}>
            Không có thông báo phù hợp.
          </p>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsReadAndHandle(notif)}
              className={clsx(
                "flex items-center justify-between gap-3 p-3 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800",
              )}
              style={{
                backgroundColor: notif.isRead
                  ? isDarkMode ? "#1A2B1A" : "#F0F0F0"
                  : isDarkMode ? "#C0C0C0" : "#C9C9C9",
              }}
            >
              <div className="flex items-center gap-3">
                <img
                  src={
                    avatars[notif.senderId] || "/default-avatar.png"
                  }
                  alt="avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="text-sm font-medium dark:text-white" style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}>
                    {notif.senderName}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {notif.message}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {notif.timestamp.toLocaleDateString("vi-VN")}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
