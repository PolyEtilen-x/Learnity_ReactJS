import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider";
import { AppBackgroundStyles, AppTextStyles } from "../theme/theme";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useCurrentUser } from "../hooks/useCurrentUser";

interface UserInfoModel {
  uid: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  followers?: string[];
}

export default function SearchPanel({ onClose }: { onClose: () => void }) {
    const { isDarkMode } = useTheme();
    const { user } = useCurrentUser();
    const navigate = useNavigate();
    const panelRef = useRef<HTMLDivElement>(null);

    const [search, setSearch] = useState("");
    const [allUsers, setAllUsers] = useState<UserInfoModel[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserInfoModel[]>([]);

    // Expose fetchUsers for handleFollow to use
    const fetchUsers = async () => {
        const snapshot = await getDocs(collection(db, "users"));
        const users: UserInfoModel[] = snapshot.docs.map((docSnap) => ({
            uid: docSnap.id,
            ...docSnap.data(),
        })) as UserInfoModel[];
        const others = users.filter((u) => u.uid !== user?.uid);
        setAllUsers(others);
        setFilteredUsers(others);
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid]);

    useEffect(() => {
        const q = search.toLowerCase();
        const filtered = allUsers.filter(
            (u) =>
                u.username?.toLowerCase().includes(q) ||
                u.displayName?.toLowerCase().includes(q)
        );
        setFilteredUsers(filtered);
    }, [search, allUsers]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
                navigate("/home");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose, navigate]);

    const handleFollow = async (target: UserInfoModel) => {
        if (!user?.uid || !target.uid) return;
        const isFollowing = target.followers?.includes(user.uid);
        const targetRef = doc(db, "users", target.uid);
        const currentRef = doc(db, "users", user.uid);

        try {
            await updateDoc(targetRef, {
                followers: isFollowing ? arrayRemove(user.uid) : arrayUnion(user.uid),
            });
            await updateDoc(currentRef, {
                following: isFollowing ? arrayRemove(target.uid) : arrayUnion(target.uid),
            });
            await fetchUsers();
        } catch (err) {
            console.error("Lỗi khi cập nhật theo dõi:", err);
        }
    };

    return (
        <div
            ref={panelRef}
            className="fixed top-0 left-[80px] md:left-[80px] h-screen w-[400px] z-50 shadow-xl border-r overflow-y-auto"
            style={{
                backgroundColor: isDarkMode ? "#1a1a1a" : "#E8F8F6",
                borderColor: isDarkMode ? "#444" : "#e5e5e5",
            }}
        >
            {/* Search Input */}
            <div className="p-4 border-b" style={{ borderColor: isDarkMode ? "#444" : "#e5e5e5" }}>
                <h2 style={AppTextStyles.title(isDarkMode)}>Search</h2>
                <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full mt-2 px-3 py-2 rounded bg-white text-black border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-black"
                />
            </div>

            {/* User Results */}
            <div className="p-4 space-y-3">
                {filteredUsers.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Không tìm thấy người dùng.</p>
                ) : (
                    filteredUsers.map((u) => (
                        <div
                            key={u.uid}
                            className="flex justify-between items-center p-2 rounded hover:bg-white dark:hover:bg-gray-800"
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={u.avatarUrl || "/default-avatar.png"}
                                    className="w-10 h-10 rounded-full"
                                    alt="avatar"
                                />
                                <div>
                                    <div className="font-medium text-black dark:text-white">
                                        {u.displayName || "Người dùng"}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">@{u.username}</div>
                                </div>
                            </div>

                            <button
                            onClick={() => handleFollow(u)}
                            className="px-3 py-1 text-sm rounded"
                            style={{
                                backgroundColor: u.followers?.includes(user?.uid || "")
                                ? AppBackgroundStyles.footerBackground(isDarkMode)
                                : AppBackgroundStyles.mainBackground(isDarkMode),
                                color: u.followers?.includes(user?.uid || "") ? "#fff" : "#000000",
                            }}
                            >
                            {u.followers?.includes(user?.uid || "") ? "Đang theo dõi" : "Theo dõi"}
                            </button>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
function fetchUsers() {
    throw new Error("Function not implemented.");
}

