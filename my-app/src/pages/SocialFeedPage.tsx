import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { type PostModel } from "../models/PostModel";
import PostCard from "../components/PostCard";
import { useTheme } from "../theme/ThemeProvider";
import { AppBackgroundStyles, AppTextStyles } from "../theme/theme";

export default function SocialFeedPage() {
  const { isDarkMode } = useTheme();
  const [posts, setPosts] = useState<PostModel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        ...(doc.data() as Omit<PostModel, "postId" | "createdAt">),
        postId: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));
      setPosts(data);
    } catch (error) {
      console.error("Lỗi khi tải bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div
      className="w-full h-full overflow-y-auto flex justify-center"
      style={{ backgroundColor: AppBackgroundStyles.mainBackground(isDarkMode) }}
    >
      <div className="w-full max-w-xl p-4">

        {loading ? (
          <p style={AppTextStyles.body(isDarkMode)}>Đang tải...</p>
        ) : posts.length === 0 ? (
          <p style={AppTextStyles.body(isDarkMode)}>Không có bài viết nào.</p>
        ) : (
          posts.map((post) => (
            <div key={post.postId} className="mb-6">
              <PostCard post={post} isDarkMode={isDarkMode} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
