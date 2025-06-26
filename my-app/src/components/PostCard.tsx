import { useEffect, useState } from "react";
import { type PostModel } from "../models/PostModel";
import { Heart, MessageCircle, Share2, X } from "lucide-react";
import {
  doc,
  getDoc,
  updateDoc,
  increment,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { AppTextStyles } from "../theme/theme";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale/vi";
import PostDetailPanel from "../pages/PostDetailPanel";
import ShareOptionsDialog from "./ShareOptionsDialog"; // NEW

interface PostCardProps {
  post: PostModel;
  isDarkMode: boolean;
  onPostUpdated?: () => void;
}

export default function PostCard({ post, isDarkMode, onPostUpdated }: PostCardProps) {
  const { user } = useCurrentUser();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [commentCount, setCommentCount] = useState(0);
  const [shareCount, setShareCount] = useState(post.shares || 0);
  const [showDetail, setShowDetail] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const postRef = doc(db, "posts", post.postId!);
  const likeDocRef = doc(db, "post_likes", `${post.postId}_${user?.uid}`);
  const commentsCollection = collection(db, "comments", post.postId!, "list");

  useEffect(() => {
    if (!user || !post.postId) return;

    const fetchState = async () => {
      const likeSnap = await getDoc(likeDocRef);
      setIsLiked(likeSnap.exists());

      const postSnap = await getDoc(postRef);
      setLikeCount(postSnap.data()?.likes || 0);
      setShareCount(postSnap.data()?.shares || 0);

      const commentSnap = await getDocs(commentsCollection);
      setCommentCount(commentSnap.size);
    };

    fetchState();
  }, [post.postId, user]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowDetail(false);
        setShowImageModal(false);
        setShowShareOptions(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleLikePost = async () => {
    if (!user || !post.postId) return;
    try {
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
      onPostUpdated?.();
    } catch (error) {
      console.error("Lỗi khi like:", error);
    }
  };

  const handleInternalShare = async () => {
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

  const handleExternalShare = async () => {
    const text = `${post.content ?? ""}\n\n${post.postDescription ?? ""}\n(Chia sẻ từ Learnity)`;
    try {
      await navigator.share({ text });
    } catch (err) {
      console.error("Không thể chia sẻ ra ngoài:", err);
    }
  };

  return (
    <div className="w-full border-b px-4 py-5 relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={post.avatarUrl || "/default-avatar.png"}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div style={AppTextStyles.subtitle(isDarkMode)}>
              {post.username || "Người dùng"}
            </div>
            <div style={AppTextStyles.caption(isDarkMode)}>
              {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: vi })}
            </div>
          </div>
        </div>
      </div>

      {post.postDescription && (
        <p style={AppTextStyles.label(isDarkMode)} className="mb-1">
          {post.postDescription}
        </p>
      )}
      {post.content && (
        <p style={AppTextStyles.body(isDarkMode)} className="mb-3">
          {post.content}
        </p>
      )}
      {post.imageUrl && (
        <div className="mb-3 rounded-md overflow-hidden">
          <img
            src={post.imageUrl}
            alt="post"
            className="w-full object-cover cursor-pointer"
            onClick={() => setShowImageModal(true)}
          />
        </div>
      )}

      <div className={`flex gap-6 items-center text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
        <button className="flex items-center gap-1" onClick={handleLikePost}>
          <Heart size={18} fill={isLiked ? "red" : "none"} stroke={isLiked ? "red" : "currentColor"} />
          <span>{likeCount}</span>
        </button>

        <button className="flex items-center gap-1" onClick={() => setShowDetail(true)}>
          <MessageCircle size={18} />
          <span>{commentCount}</span>
        </button>

        <button className="flex items-center gap-1" onClick={() => setShowShareOptions(true)}>
          <Share2 size={18} />
          <span>{shareCount}</span>
        </button>
      </div>

      {showDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <PostDetailPanel post={post} onClose={() => setShowDetail(false)} />
        </div>
      )}

      {showImageModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center" onClick={() => setShowImageModal(false)}>
          <img src={post.imageUrl} className="max-w-full max-h-full rounded" />
          <button className="absolute top-4 right-4" onClick={() => setShowImageModal(false)}>
            <X className="text-black" />
          </button>
        </div>
      )}

      <ShareOptionsDialog
        isOpen={showShareOptions}
        onClose={() => setShowShareOptions(false)}
        onInternalShare={handleInternalShare}
        onExternalShare={handleExternalShare}
      />
    </div>
  );
}
