import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface GroupPost {
  id: string;
  title: string;
  text: string;
  imageUrl?: string;
  createdAt: Date;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
}

export default function GroupContentPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const [groupData, setGroupData] = useState<any>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;
    const fetchData = async () => {
      setIsLoading(true);
      const groupRef = doc(db, "communityGroups", groupId);
      const groupSnap = await getDoc(groupRef);
      if (groupSnap.exists()) {
        setGroupData({ id: groupSnap.id, ...groupSnap.data() });
      }

      const postsRef = collection(db, "groupPosts");
      const q = query(postsRef, where("groupId", "==", groupId));
      const postSnap = await getDocs(q);

      const postList = postSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "",
          text: data.text || "",
          imageUrl: data.imageUrl,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          likesCount: data.likedBy?.length || 0,
          commentsCount: data.commentsCount || 0,
          sharesCount: data.sharesCount || 0,
        };
      });
      setPosts(postList);
      setIsLoading(false);
    };

    fetchData();
  }, [groupId]);

  if (isLoading) return <div className="text-center mt-10">Đang tải...</div>;
  if (!groupData) return <div className="text-center mt-10">Không tìm thấy nhóm</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="rounded overflow-hidden mb-4">
        <img
          src={groupData.avatarUrl || "/default-avatar.png"}
          alt="group"
          className="w-full h-64 object-cover"
        />
      </div>
      <h2 className="text-2xl font-bold mb-1">{groupData.name}</h2>
      <p className="text-gray-500 mb-2">
        {groupData.privacy} • {groupData.membersCount || 0} thành viên
      </p>
      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">Chưa có bài viết nào trong nhóm này.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="border p-4 rounded">
              <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="post"
                  className="w-full h-60 object-cover rounded mb-2"
                />
              )}
              <p className="mb-2">{post.text}</p>
              <p className="text-sm text-gray-500">
                {format(post.createdAt, "d MMM, HH:mm", { locale: vi })} • {post.likesCount} lượt thích • {post.commentsCount} bình luận • {post.sharesCount} chia sẻ
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
