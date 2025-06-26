import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Heart, MessageCircle, Share2, X } from "lucide-react";
import { type PostModel } from "../models/PostModel";
import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
  increment,
  deleteDoc,
  setDoc,
  getDoc,
  where
} from "firebase/firestore";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useTheme } from "../theme/ThemeProvider";
import { AppBackgroundStyles } from "../theme/theme";

interface Props {
  post: PostModel;
  onClose: () => void;
}

export default function PostDetailPanel({ post, onClose }: Props) {
  const { isDarkMode } = useTheme();
  const { user } = useCurrentUser();
  const [comments, setComments] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [shareCount, setShareCount] = useState(post.shares || 0);

  const commentRef = collection(db, "comments", post.postId!, "list");
  const postRef = doc(db, "posts", post.postId!);
  const likeDocRef = doc(db, "post_likes", `${post.postId}_${user?.uid}`);

  useEffect(() => {
    const fetchComments = async () => {
      const snap = await getDocs(query(commentRef, orderBy("createdAt", "desc")));
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComments(list);
    };

    const fetchLikeState = async () => {
      const likeSnap = await getDoc(likeDocRef);
      setIsLiked(likeSnap.exists());
    };

    const fetchLikeCount = async () => {
      const snap = await getDoc(postRef);
      setLikeCount(snap.data()?.likes || 0);
      setShareCount(snap.data()?.shares || 0);
    };

    fetchComments();
    fetchLikeState();
    fetchLikeCount();
  }, [post.postId]);

  const handleSubmit = async () => {
    if (!input.trim() || !user) return;

    await addDoc(commentRef, {
      content: input.trim(),
      userId: user.uid,
      username: user.username,
      userAvatar: user.avatarUrl,
      createdAt: serverTimestamp(),
    });

    setInput("");
    const snap = await getDocs(query(commentRef, orderBy("createdAt", "desc")));
    setComments(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const handleLike = async () => {
    if (!user) return;
    if (isLiked) {
      await updateDoc(postRef, { likes: increment(-1) });
      await deleteDoc(likeDocRef);
      setLikeCount((prev) => prev - 1);
    } else {
      await updateDoc(postRef, { likes: increment(1) });
      await setDoc(likeDocRef, {
        postId: post.postId,
        userId: user.uid,
        liked: true,
        likedAt: new Date(),
      });
      setLikeCount((prev) => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleShare = async () => {
    if (!user || !post.postId || !post.uid) return;
    const existing = await getDocs(
      query(
        collection(db, "shared_posts"),
        where("postId", "==", post.postId),
        where("sharerUserId", "==", user.uid)
      )
    );
    if (!existing.empty) {
      alert("Bạn đã chia sẻ bài viết này rồi.");
      return;
    }
    await addDoc(collection(db, "shared_posts"), {
      postId: post.postId,
      originUserId: post.uid,
      sharerUserId: user.uid,
      sharedAt: new Date(),
      likeBy: [],
    });
    await updateDoc(postRef, { shares: increment(1) });
    setShareCount((prev) => prev + 1);
    alert("Đã chia sẻ bài viết.");
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="bg-white max-w-xl w-full max-h-[90vh] overflow-auto rounded-lg shadow-lg p-4 relative"
            style={{ backgroundColor: AppBackgroundStyles.mainBackground(isDarkMode) }}

      >
        <button onClick={onClose} className="absolute top-3 right-3">
          <X />
        </button>

        <div className="mb-4">
          <h2 className="text-lg font-bold">{post.username}</h2>
          <p className="text-sm text-gray-500">{post.postDescription}</p>
          <p className="mt-2">{post.content}</p>
          {post.imageUrl && (
            <img src={post.imageUrl} alt="post" className="w-full mt-3 rounded cursor-pointer" />
          )}
        </div>

        <div className="flex gap-6 items-center text-sm text-gray-600 mb-4">
          <button className="flex items-center gap-1" onClick={handleLike}>
            <Heart
              size={18}
              fill={isLiked ? "red" : "none"}
              stroke={isLiked ? "red" : "currentColor"}
            />
            <span>{likeCount}</span>
          </button>
          <div className="flex items-center gap-1">
            <MessageCircle size={18} />
            <span>{comments.length}</span>
          </div>
          <button className="flex items-center gap-1" onClick={handleShare}>
            <Share2 size={18} />
            <span>{shareCount}</span>
          </button>
        </div>

        <div className="border-t pt-3">
          <h3 className="font-semibold mb-2">Bình luận</h3>

          <div className="space-y-3 mb-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2 items-start">
                <img
                  src={c.userAvatar || "/default-avatar.png"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="text-sm font-semibold">{c.username}</p>
                  <p className="text-sm">{c.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập bình luận..."
              className="flex-1 border rounded px-3 py-1"
            />
            <button
              onClick={handleSubmit}
              className="bg-black text-blue-500 px-4 rounded"
              
            >
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
