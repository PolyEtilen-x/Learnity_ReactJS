import { useEffect, useState } from "react";
import { collection, getDocs, getDoc, doc, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { postFromDocument } from "../models/PostModel";
import type { PostModel } from "../models/PostModel";
import { AppBackgroundStyles } from "../theme/theme";
import { useTheme } from "../theme/ThemeProvider";

interface UserInfoModel {
  uid: string;
  displayName?: string;
  avatarUrl?: string;
}

interface SharedPostItem {
  post: PostModel;
  sharer: UserInfoModel;
  poster: UserInfoModel;
  sharedAt: Date;
  sharedPostId: string;
  originalGroupName?: string | null;
}

export default function SharedPostTab() {
  const { user } = useCurrentUser();
  const { isDarkMode } = useTheme();
  const [sharedPosts, setSharedPosts] = useState<SharedPostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSharedPosts = async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const sharedSnap = await getDocs(
          query(
            collection(db, "shared_posts"),
            where("sharerUserId", "==", user.uid),
            orderBy("sharedAt", "desc")
          )
        );

        const results: SharedPostItem[] = [];

        for (const docSnap of sharedSnap.docs) {
          const data = docSnap.data();

          const sharerSnap = await getDoc(doc(db, "users", data.sharerUserId));
          const posterSnap = await getDoc(doc(db, "users", data.originUserId));

          if (!sharerSnap.exists() || !posterSnap.exists()) continue;

          const sharer = { uid: sharerSnap.id, ...sharerSnap.data() } as UserInfoModel;
          const poster = { uid: posterSnap.id, ...posterSnap.data() } as UserInfoModel;

          if (data.sharedInfo) {
            // group share
            results.push({
              post: {
                postId: data.postId || docSnap.id,
                uid: data.originUserId,
                content: data.text,
                createdAt: data.sharedAt.toDate(),
                imageUrl: data.imageUrl || "",
                postDescription: data.postDescription || "",
              } as PostModel,
              sharer,
              poster,
              sharedAt: data.sharedAt.toDate(),
              sharedPostId: docSnap.id,
              originalGroupName: data.sharedInfo.originalGroupName,
            });
          } else {
            // user share
            const postSnap = await getDoc(doc(db, "posts", data.postId));
            if (!postSnap.exists()) continue;
            const post = postFromDocument(postSnap);

            results.push({
              post,
              sharer,
              poster,
              sharedAt: data.sharedAt.toDate(),
              sharedPostId: docSnap.id,
            });
          }
        }

        setSharedPosts(results);
      } catch (err) {
        console.error("Lỗi khi tải danh sách bài chia sẻ:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedPosts();
  }, [user?.uid]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  if (!sharedPosts.length) return <div className="p-4 text-center">Chưa chia sẻ bài viết nào.</div>;

  return (
    <div className="mt-6 w-full flex justify-center">
      <div className="w-full max-w-xl space-y-6">
        {sharedPosts.map(({ post, sharer, poster, sharedAt, sharedPostId, originalGroupName }) => (
          <div key={sharedPostId} className="p-4 rounded-lg border" style={{ backgroundColor: "#C8FAE4" }}>
            <div className="text-lg text-gray-600 mb-2">
              <b>{sharer.displayName}</b> đã chia sẻ bài viết của <b>{poster.displayName}</b>
              {originalGroupName && <> từ nhóm <b>{originalGroupName}</b></>}
            </div>
            <div className="text-xs text-gray-400 mb-2">{sharedAt.toLocaleString()}</div>
            <div className="text-lg font-semibold">{post.postDescription}</div>
            <div className="text-base mt-1 whitespace-pre-wrap">{post.content}</div>
            {post.imageUrl && (
              <img src={post.imageUrl} alt="img" className="mt-2 rounded-md w-full object-cover" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
