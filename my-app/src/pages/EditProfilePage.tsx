import { useEffect, useState, useRef } from "react";
import { getAuth, updatePassword } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useTheme } from "../theme/ThemeProvider";
import { AppBackgroundStyles } from "../theme/theme";
import axios from "axios";
import { uploadImageToCloudinary } from "../utils/uploadtoCloudinary";

export default function EditProfilePage() {
  const { user } = useCurrentUser();
  const { isDarkMode } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const auth = getAuth();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [password, setPassword] = useState("");
  const [obscurePassword, setObscurePassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const snap = await getDoc(doc(db, "users", user.uid!));
        const data = snap.data();
        if (data) {
          setDisplayName(data.displayName || "");
          setBio(data.bio || "");
          setAvatarUrl(data.avatarUrl || "");
        }

        const authUser = auth.currentUser;
        const emailBased =
          authUser?.providerData?.some((p) => p.providerId === "password") || false;
        setIsEmailUser(emailBased);
      } catch (error) {
        console.error("Lỗi khi tải hồ sơ:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, auth]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const imageFile = e.target.files?.[0];
  if (!imageFile || !user?.uid) return;

  try {
    const uploadedImageUrl = await uploadImageToCloudinary(
      imageFile,
      `Learnity/Users/${user.uid}/avatar_${user.uid}`
    );

    if (!uploadedImageUrl) {
      console.error("Upload ảnh thất bại");
      return;
    }

    setAvatarUrl(uploadedImageUrl);
  } catch (error) {
    console.error("Lỗi khi tải ảnh:", error);
    alert("Tải ảnh không thành công.");
  }
};


  const handleSubmit = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      await updateDoc(doc(db, "users", user.uid!), {
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarUrl,
        updatedAt: serverTimestamp(),
      });

      if (password && isEmailUser && auth.currentUser) {
        await updatePassword(auth.currentUser, password);
      }

      alert("Cập nhật hồ sơ thành công!");
    } catch (e: any) {
      alert("Lỗi: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="max-w-xl mx-auto px-4 py-6"
      style={{ backgroundColor: AppBackgroundStyles.mainBackground(isDarkMode) }}
    >
      <h1 className="text-2xl font-bold mb-4 text-center">Chỉnh sửa hồ sơ</h1>

      <div className="flex flex-col items-center">
        <img
          src={avatarUrl || "/default-avatar.png"}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover border"
        />
        <button
          className="mt-2 text-blue-500 underline"
          onClick={() => fileInputRef.current?.click()}
        >
          Đổi ảnh đại diện
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>

      <label className="block mt-6 font-medium">Tên hiển thị</label>
      <input
        className="w-full p-2 rounded border mt-1"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
      />

      <label className="block mt-4 font-medium">Tiểu sử</label>
      <textarea
        className="w-full p-2 rounded border mt-1"
        value={bio}
        rows={3}
        onChange={(e) => setBio(e.target.value)}
      />

      {isEmailUser && (
        <>
          <label className="block mt-4 font-medium">Mật khẩu mới</label>
          <div className="relative">
            <input
              type={obscurePassword ? "password" : "text"}
              className="w-full p-2 rounded border mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-0 top-0 text-sm text-gray-600"
              onClick={() => setObscurePassword(!obscurePassword)}
            >
              {obscurePassword ? "Hiện" : "Ẩn"}
            </button>
          </div>
        </>
      )}

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="mt-6 w-full bg-blue-500 text-black py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </div>
  );
}
