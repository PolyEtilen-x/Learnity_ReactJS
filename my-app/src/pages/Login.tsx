import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { messaging } from "../firebaseMessaging";
import { getToken } from "firebase/messaging";
import learnityImg from "../assets/learnity.png";
import googleImg from "../assets/google.png";
import { useTheme } from "../theme/ThemeProvider";
import { AppColors, AppTextStyles } from "../theme/theme";

export default function Login() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      await saveFcmToken(user);
      navigate("/home");
    } catch (err: any) {
      switch (err.code) {
        case "auth/user-not-found":
          setError("Tài khoản không tồn tại");
          break;
        case "auth/wrong-password":
          setError("Sai mật khẩu");
          break;
        default:
          setError("Đã xảy ra lỗi: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          username: user.displayName,
          displayName: user.displayName,
          createdAt: new Date(),
          bio: "",
          avatarUrl: user.photoURL,
          followers: [],
          following: [],
          posts: [],
          signInMethod: "google",
        });
        navigate("/set-username", {
          state: {
            userId: user.uid,
            displayName: user.displayName,
            email: user.email,
            avatarUrl: user.photoURL,
          },
        });
      } else {
        const data = docSnap.data();
        if (!data.username) {
          navigate("/set-username", {
            state: {
              userId: user.uid,
              displayName: data.displayName || user.displayName,
              email: data.email || user.email,
              avatarUrl: data.avatarUrl || user.photoURL,
            },
          });
        } else {
          navigate("/home");
        }
      }

      await saveFcmToken(user);
    } catch (err) {
      setError("Lỗi khi đăng nhập bằng Google");
    } finally {
      setLoading(false);
    }
  };

  const saveFcmToken = async (user: User) => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const fcmToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      if (fcmToken) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          fcmTokens: arrayUnion(fcmToken),
          lastFcmTokenUpdate: new Date(),
        });
      }
    } catch (err) {
      console.warn("Không lấy được FCM token:", err);
    }
  };

  return (
    <div
      className="w-screen h-screen flex items-center justify-center px-6"
      style={{
        backgroundColor: isDarkMode
          ? AppColors.darkBackground
          : AppColors.background,
      }}
    >
      <div
        className="w-full max-w-md p-6 rounded-xl shadow"
        style={{
          backgroundColor: isDarkMode
            ? AppColors.darkBackgroundSecond
            : AppColors.white,
        }}
      >
        <div className="my-6">
          <img
            src={learnityImg}
            alt="Learnity"
            className="w-[120px] h-[120px] mx-auto object-contain"
          />
        </div>

        <h2
          style={AppTextStyles.subtitle(isDarkMode)}
          className="text-center mb-6"
        >
          Đăng nhập
        </h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <label style={AppTextStyles.label(isDarkMode)} className="block mb-2">
          Email
        </label>
        <input
          type="email"
          className="w-full border p-2 rounded mb-4"
          style={{
            color: isDarkMode
              ? AppColors.darkTextPrimary
              : AppColors.textPrimary,
            backgroundColor: isDarkMode
              ? AppColors.darkBackgroundSecond
              : "#fff",
          }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label style={AppTextStyles.label(isDarkMode)} className="block mb-2">
          Mật khẩu
        </label>
        <input
          type="password"
          className="w-full border p-2 rounded mb-4"
          style={{
            color: isDarkMode
              ? AppColors.darkTextPrimary
              : AppColors.textPrimary,
            backgroundColor: isDarkMode
              ? AppColors.darkBackgroundSecond
              : "#fff",
          }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-between items-center mb-4">
          <label
            className="flex items-center"
            style={AppTextStyles.bodySecondary(isDarkMode)}
          >
            <input
              type="checkbox"
              className="mr-2"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Lưu đăng nhập
          </label>
          <button
            className="text-sm underline"
            style={AppTextStyles.link(isDarkMode)}
            onClick={() => navigate("/forgot-password")}
          >
            Quên mật khẩu?
          </button>
        </div>

        <button
          className="w-full py-2 rounded mb-4 transition-colors duration-200"
          style={{
            backgroundColor: isDarkMode
              ? AppColors.darkButtonBg
              : AppColors.buttonBg,
            color: isDarkMode
              ? AppColors.darkButtonText
              : AppColors.buttonText,
          }}
          disabled={loading}
          onClick={handleLogin}
        >
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>

        <p
          className="text-center text-sm mb-2"
          style={AppTextStyles.bodySecondary(isDarkMode)}
        >
          Bạn mới biết đến Learnity?{" "}
          <span
            onClick={() => navigate("/signup")}
            style={AppTextStyles.link(isDarkMode)}
            className="cursor-pointer"
          >
            Đăng ký
          </span>
        </p>

        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300 dark:bg-gray-600"></div>
          <span
            className="px-4 text-sm"
            style={AppTextStyles.bodySecondary(isDarkMode)}
          >
            Hoặc
          </span>
          <div className="flex-grow h-px bg-gray-300 dark:bg-gray-600"></div>
        </div>

        <button
          className="w-full border py-2 rounded flex justify-center items-center bg-white"
          onClick={handleGoogleLogin}
        >
          <img
            src={googleImg}
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          <span
            className="text-sm"
            style={{
              color: isDarkMode
                ? AppColors.darkTextPrimary
                : AppColors.textPrimary,
            }}
          >
            Tiếp tục với Google
          </span>
        </button>

        <p
          className="text-xs text-center mt-6"
          style={AppTextStyles.caption(isDarkMode)}
        >
          Điều khoản sử dụng | Chính sách riêng tư
        </p>
      </div>
    </div>
  );
}
