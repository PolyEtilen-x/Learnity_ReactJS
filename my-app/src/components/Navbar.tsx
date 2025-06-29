import {
  Home,
  Search,
  MessageCircle,
  Bell,
  UserCircle,
  UsersRound,
  PlusSquare,
  Settings
} from "lucide-react";
import { useTheme } from "../theme/ThemeProvider";
import { AppColors } from "../theme/theme";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate, useLocation } from "react-router-dom";
import learnityImg from "../assets/learnity.png";
import { useState, useEffect } from "react";
import SearchPanel from "../pages/SearchPanel";
import NotificationPanel from "../pages/NotificationPanel"; 
import ProfilePage from "../pages/ProfilePage";
import GroupPage from "../pages/GroupPage";
import { is } from "date-fns/locale";


export default function Navbar() {
  const { isDarkMode } = useTheme();
  const {user, displayName, avatarUrl } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  const [activeKey, setActiveKey] = useState<string>("");

  const iconColor = isDarkMode ? "#FFFFFF" : "#000000";

    useEffect(() => {
    const pathToKeyMap: Record<string, string> = {
      "/home": "home",
      "/create": "create",
      "/messages": "messages",
      "/notifications": "notifications",
      "/groups": "groups",
      "/profile": "profile",
      "/settings": "settings",
    };

    const matchedKey = pathToKeyMap[location.pathname];
    if (matchedKey) setActiveKey(matchedKey);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/messages") {
      setCollapsed(true);
    } else {
      const saved = localStorage.getItem("sidebarCollapsed");
      setCollapsed(saved === "true");
    }
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/login");
  };

const menuItems = [
  { key: "home", 
    label: "Trang chủ", 
    icon: <Home color={iconColor} />,
    onClick: () => {
      navigate("/home");
      setActiveKey("home");
      setCollapsed(false);
    },
  },
  {
    key: "search",
    label: "Tìm kiếm",
    icon: <Search color={iconColor} />,
    onClick: () => {
      setShowSearchPanel(true);
      setCollapsed(true);
      setActiveKey("search");
    },
  },
  { key: "create", 
    label: "Tạo", 
    icon: <PlusSquare color={iconColor} />, 
    path: "/create",
    onClick: () => {
      navigate("/create");
      setActiveKey("create");
      setCollapsed(false);
    },
  },
  { key: "messages", 
    label: "Tin nhắn", 
    icon: <MessageCircle color={iconColor} />,
    
    onClick: () => {
      navigate("/messages");
      setActiveKey("messages");
    },
  },
  {
    key: "notifications",
    label: "Thông báo",
    icon: <Bell color={iconColor} />,
    onClick: () => {
      setShowNotificationPanel(true);
      setCollapsed(true);
      setActiveKey("notifications");
      setShowSearchPanel(false);
    },
  },
  { key: "groups", label: "Nhóm", icon: <UsersRound color={iconColor} />, path: "/groups" },
  {
    key: "profile",
      label: "Hồ sơ",
      icon: <UserCircle color={iconColor} />,
      onClick: () => {
        navigate("/profile");
        setActiveKey("profile");
      },
  },
  {
    key: "settings",
    label: "Cài đặt",
    icon: <Settings color={iconColor} />,
    onClick: () => {
      navigate("/settings");
      setActiveKey("settings");
    },
  },
];

  useEffect(() => {
  localStorage.setItem("sidebarCollapsed", collapsed.toString());
}, [collapsed]);



  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-screen transition-all duration-300 ${
          collapsed ? "w-[80px]" : "w-[240px]"
        } border-r px-2 py-4 flex flex-col items-center md:items-start z-50`}
        style={{
          backgroundColor: isDarkMode ? "#163B25" : "#C8FAE4",
          borderColor: isDarkMode ? "FFFFFF" : "#000000",
        }}
      >
        <div className="w-full mb-4 flex items-center justify-between px-2">
          <img
            src={learnityImg}
            alt="Learnity"
            className={`object-contain transition-all duration-300 ${
              collapsed ? "w-8 h-8" : "w-[100px] h-[100px]"
            }`}
          />
        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-2 w-full items-center md:items-start" style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}>
          {menuItems.map((item) => (
            <MenuItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else if (item.path) {
                      navigate(item.path);
                      setActiveKey(item.key); 
                    }
                  }}         
              active={activeKey === item.key}
              collapsed={collapsed}
              isDarkMode={isDarkMode}
            />
          ))}
        </nav>

        <div className="mt-auto w-full pt-4">
          <div
            className="flex items-center gap-3 px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer transition"
            onClick={handleSignOut}
          >
            <img
              src={avatarUrl || "https://i.pravatar.cc/100"}
              alt="Avatar"
              className="rounded-full w-8 h-8"
            />
            {!collapsed && (
              <div className="hidden md:flex flex-col">
                <span className="text-sm font-medium" style={{ color: iconColor }}>
                  {displayName || "Người dùng"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Đăng xuất
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {showNotificationPanel && (
        <NotificationPanel
          userId={user?.uid || ""}
          onClose={() => {
            setShowNotificationPanel(false);
            setCollapsed(false);
          }}
        />
      )}

      {showSearchPanel && (
        <SearchPanel onClose={() => {setShowSearchPanel(false);setCollapsed(false)}} />
      )}


    </>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  active,
  collapsed,
  isDarkMode,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active: boolean;
  collapsed: boolean;
  isDarkMode: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-2 py-2 rounded-md cursor-pointer transition-colors ${
        active
          ? isDarkMode
            ? "bg-gray-700"
            : "bg-gray-200"
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <div className="text-xl">{icon}</div>
      {!collapsed && <span className="hidden md:inline text-sm font-medium">{label}</span>}
    </div>
  );
}

