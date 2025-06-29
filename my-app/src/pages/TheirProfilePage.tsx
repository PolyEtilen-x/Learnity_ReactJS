import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useTheme } from "../theme/ThemeProvider";
import { AppBackgroundStyles } from "../theme/theme";
import PostCard from "../components/PostCard"; 
import { useParams } from "react-router-dom";
import SharedPostTab from "../components/SharedPostList"; // Đảm bảo bạn đã import đúng

interface UserInfoModel {
  uid: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  followers?: string[];
  bio?: string;
}

export default function TheirProfilePage() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<UserInfoModel | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("posts");
  const { isDarkMode } = useTheme();
  const { userId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        // Fetch user data
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setProfileData({ uid: userId, ...userDoc.data() });
        }

        // Fetch user posts
        const postSnap = await getDocs(collection(db, "posts"));
        const userPosts = postSnap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))  // Include `id` for each post
          .filter((post: any) => post.uid === userId)
          .sort((a: any, b: any) => b.createdAt - a.createdAt);

        setPosts(userPosts);
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!profileData) return <div>User not found.</div>;

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
            <h2 className="text-2xl font-semibold">{profileData.displayName}</h2>
          </div>
          <div className="flex gap-4 mt-2 text-sm">
            <span><b>{posts.length}</b> Bài đăng</span>
            <span><b>{profileData.followers?.length || 0}</b> Đang theo dõi</span>
            <span><b>0</b> Đã theo dõi</span>
          </div>
          <div className="mt-2">
            <p className="font-medium">{profileData.username}</p>
            <p className="text-sm">{profileData.bio || "Không có mô tả"}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mt-2">
        {[{ key: "posts", label: "Bài đăng" }, { key: "shared", label: "Bài chia sẻ" }].map((item) => (
          <button
            key={item.key}
            className={`px-12 py-5 text-2xl font-bold rounded-full whitespace-nowrap border ${tab === item.key ? 'border-4 border-blue-500' : 'border-gray-400'}`}
            style={{
              backgroundColor:
                tab === item.key
                  ? AppBackgroundStyles.footerBackground(isDarkMode)
                  : AppBackgroundStyles.mainBackground(isDarkMode),
              color: tab === item.key ? "#ffffff" : "#000000",
            }}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "posts" && (
          <div className="w-full flex justify-center">
            <div className="w-full max-w-xl">
              {posts.map((post: any) => (
                <PostCard key={post.id} post={post} isDarkMode={isDarkMode} />  
              ))}
            </div>
          </div>
        )}

        {tab === "shared" && <SharedPostTab userId={userId ?? ""} />}
      </div>
    </div>
  );
}
