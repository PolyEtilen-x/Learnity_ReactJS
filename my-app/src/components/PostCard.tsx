import { useEffect, useState } from "react";
import { type PostModel } from "../models/PostModel";
import {
  FiMoreVertical,
  FiHeart,
  FiMessageCircle,
  FiShare2,
} from "react-icons/fi";
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
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale/vi";
import PostDetailPanel from "../pages/PostDetailPanel";
import ShareOptionsDialog from "./ShareOptionsDialog";

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

  const ActionButton = ({ icon, count, onClick, active }: { icon: React.ReactNode; count: number; onClick: () => void; active?: boolean }) => (
    <button onClick={onClick} className="flex items-center gap-1 text-sm text-gray-700 hover:text-black">
      <span className={`text-lg ${active ? "text-red-500" : ""}`}>{icon}</span>
      <span>{count}</span>
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 mb-4" style={{ backgroundColor: "#C8FAE4" }}>
      <div className="flex items-start gap-3">
        <img
          src={post.avatarUrl || "/default-avatar.png"}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-sm">{post.username || "Người dùng"}</p>
              <p className="text-xs text-gray-500">{formatDistanceToNow(post.createdAt, { addSuffix: true, locale: vi })}</p>
            </div>
            <FiMoreVertical className="text-gray-600 cursor-pointer" onClick={() => {
              if (user?.uid === post.uid && window.confirm("Bạn có muốn xóa bài viết này?")) {
                console.log("Trigger delete function");
              }
            }} />
          </div>
          {post.postDescription && <p className="font-bold mt-2 text-base">{post.postDescription}</p>}
          {post.content && <p className="mt-1 text-sm text-gray-800 whitespace-pre-line">{post.content}</p>}
          {post.imageUrl && (
            <div className="mt-3">
              <img
                src={post.imageUrl}
                alt="post"
                className="rounded-md w-full max-h-[300px] object-cover"
                onError={(e) => (e.currentTarget.src = "/broken-image.png")}
              />
            </div>
          )}
          <div className="flex justify-around items-center mt-4 border-t pt-2 text-sm">
            <ActionButton icon={isLiked ? <FiHeart fill="red" /> : <FiHeart />} count={likeCount} onClick={handleLikePost} active={isLiked} />
            <ActionButton icon={<FiMessageCircle />} count={commentCount} onClick={() => setShowDetail(true)} />
            <ActionButton icon={<FiShare2 />} count={shareCount} onClick={() => setShowShareOptions(true)} />
          </div>
        </div>
      </div>

      <ShareOptionsDialog
        isOpen={showShareOptions}
        onClose={() => setShowShareOptions(false)}
        onInternalShare={handleInternalShare}
        onExternalShare={async () => {
          const text = `${post.content ?? ""}\n\n${post.postDescription ?? ""}\n(Chia sẻ từ Learnity)`;
          try {
            await navigator.share({ text });
          } catch (err) {
            console.error("Không thể chia sẻ ra ngoài:", err);
          }
        }}
      />

      {showDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <PostDetailPanel post={post} onClose={() => setShowDetail(false)} />
        </div>
      )}
    </div>
  );
}
