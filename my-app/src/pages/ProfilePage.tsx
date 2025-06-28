import { useState, useEffect } from "react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import { useTheme } from "../theme/ThemeProvider";
import { AppBackgroundStyles } from "../theme/theme";
import type { PostModel } from "../models/PostModel";
import { postFromDocument } from "../models/PostModel";


interface UserInfoModel {
  uid: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  followers?: string[];
  bio?: string;
}

export default function ProfilePage() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<UserInfoModel | null>(null);
  const [posts, setPosts] = useState<PostModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("posts");
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setProfileData({ uid: user.uid, ...userDoc.data() });
        }

        const postSnap = await getDocs(collection(db, "posts"));
        const userPosts = postSnap.docs
          .map((doc) => postFromDocument(doc))
          .filter((post) => post.uid === user.uid)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        setPosts(userPosts);
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.uid]);

  if (loading) return <div className="p-4 ml-[400px]">Loading...</div>;
  if (!profileData) return <div className="p-4 ml-[400px]">User not found.</div>;

  return (
    <div className="p-4" style={{ marginLeft: "400px" }}>
      <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
        <img
          src={profileData.avatarUrl || "/default-avatar.png"}
          alt="avatar"
          className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover"
        />

        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">{profileData.username}</h2>
            <button
              className="px-4 py-1 rounded-md bg-gray-200 text-sm font-medium hover:bg-gray-300"
              onClick={() => navigate("/edit-profile")}
            >
              Chỉnh sửa
            </button>
            <button className="text-xl hover:opacity-60">⚙️</button>
          </div>

          <div className="flex gap-4 mt-2 text-sm">
            <span><b>{posts.length}</b> bài viết</span>
            <span><b>{profileData.followers?.length || 0}</b> người theo dõi</span>
            <span><b>0</b> đang theo dõi</span>
          </div>

          <div className="mt-2">
            <p className="font-medium">{profileData.displayName}</p>
            <p className="text-sm">{profileData.bio || "Chưa có mô tả"}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-6 mt-4">
        {[
          { key: "posts", label: "Bài đăng" },
          { key: "comments", label: "Bình luận" },
          { key: "shared", label: "Bài chia sẻ" },
        ].map((item) => (
          <button
            key={item.key}
            className={`px-16 py-6 text-2xl font-bold rounded-full whitespace-nowrap border ${tab === item.key ? 'border-4 border-blue-500' : 'border-gray-400'}`}
            style={{
              backgroundColor:
                tab === item.key
                  ? AppBackgroundStyles.footerBackground(isDarkMode)
                  : AppBackgroundStyles.mainBackground(isDarkMode),
              color: tab === item.key ? "#ffffff" : "#000000",
              fontSize: "20px",
            }}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

<div className="mt-6 w-full flex justify-center">
  <div className="w-full max-w-xl">
    {tab === "posts" &&
      posts.map((post) => (
        <div key={post.postId} className="mb-6">
          <PostCard post={post} isDarkMode={isDarkMode} />
        </div>
      ))}
  </div>
</div>

    </div>
  );
}
