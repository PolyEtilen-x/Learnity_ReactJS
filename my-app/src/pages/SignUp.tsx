import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { useTheme } from "../theme/ThemeProvider";
import { AppColors, AppTextStyles } from "../theme/theme";
import googleImg from "../assets/google.png";
import learnityImg from "../assets/learnity.png";

export default function Signup() {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const { username, email, password, confirmPassword } = form;
    if (!username || !email || !password || !confirmPassword)
      return "Vui lòng nhập đầy đủ thông tin.";
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email))
      return "Email không hợp lệ.";
    if (password.length < 6)
      return "Mật khẩu phải có ít nhất 6 ký tự.";
    if (password !== confirmPassword)
      return "Mật khẩu không khớp.";
    return "";
  };

  const handleSignup = async () => {
    const message = validate();
    if (message) return setError(message);

    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(result.user, {
        displayName: form.username,
      });

      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        username: form.username,
        displayName: form.username,
        createdAt: serverTimestamp(),
        bio: "",
        avatarUrl: "https://i.pravatar.cc/150?img=7",
        followers: [],
        following: [],
        posts: [],
        signInMethod: "email",
      });

      navigate("/login");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const ref = doc(db, "users", user.uid);
      const snapshot = await getDoc(ref);

      if (!snapshot.exists()) {
        await setDoc(ref, {
          uid: user.uid,
          email: user.email,
          username: user.displayName,
          displayName: user.displayName,
          createdAt: serverTimestamp(),
          bio: "",
          avatarUrl: user.photoURL,
          followers: [],
          following: [],
          posts: [],
          signInMethod: "google",
        });
      }

      navigate("/home");
    } catch (err) {
      setError("Lỗi khi đăng ký bằng Google");
    } finally {
      setLoading(false);
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
        className="w-full max-w-md bg-white dark:bg-[#1A1A1A] p-6 rounded-xl shadow overflow-auto"
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
          className="text-center mb-1"
          style={AppTextStyles.subtitle(isDarkMode)}
        >
          Đăng ký
        </h2>
        <p
          className="text-center text-sm mb-6"
          style={AppTextStyles.bodySecondary(isDarkMode)}
        >
          Tạo tài khoản để bắt đầu học tập
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <input
          name="username"
          placeholder="Tên người dùng"
          value={form.username}
          onChange={onChange}
          className="w-full p-2 mb-3 rounded border"
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={onChange}
          className="w-full p-2 mb-3 rounded border"
        />
        <input
          name="password"
          placeholder="Mật khẩu"
          type="password"
          value={form.password}
          onChange={onChange}
          className="w-full p-2 mb-3 rounded border"
        />
        <input
          name="confirmPassword"
          placeholder="Xác nhận mật khẩu"
          type="password"
          value={form.confirmPassword}
          onChange={onChange}
          className="w-full p-2 mb-4 rounded border"
        />

        <button
          className="w-full py-2 rounded font-semibold transition duration-150 mb-4"
          style={{
            backgroundColor: isDarkMode
              ? AppColors.darkButtonBg
              : AppColors.buttonBg,
            color: isDarkMode
              ? AppColors.darkButtonText
              : AppColors.buttonText,
          }}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>

        <button
          className="w-full py-2 rounded border flex justify-center items-center bg-white mb-4"
          onClick={handleGoogleSignup}
        >
          <img src={googleImg} className="w-5 h-5 mr-2" />
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
          className="text-center text-sm"
          style={AppTextStyles.bodySecondary(isDarkMode)}
        >
          Đã có tài khoản?{" "}
          <span
            onClick={() => navigate("/login")}
            style={AppTextStyles.link(isDarkMode)}
            className="cursor-pointer"
          >
            Đăng nhập
          </span>
        </p>
      </div>
    </div>
  );
}
