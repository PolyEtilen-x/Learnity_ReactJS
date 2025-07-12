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
  orderBy,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale/vi";
import PostDetailPanel from "../pages/PostDetailPanel";
import ShareOptionsDialog from "./ShareOptionsDialog";
import ImageViewerModal from "./ImageViewerModal";


interface PostCardProps {
  post: PostModel;
  isDarkMode: boolean;
  onPostUpdated?: () => void;
}

export default function PostCard({ post, isDarkMode, onPostUpdated }: PostCardProps) {
  const { user } = useCurrentUser();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [commentCount, setCommentCount] = useState(post.comments ?? 0);
  const [shareCount, setShareCount] = useState(post.shares || 0);
  const [showDetail, setShowDetail] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const postRef = doc(db, "posts", post.postId!);
  const likeDocRef = doc(db, "post_likes", `${post.postId}_${user?.uid}`);
  const commentsCollection = collection(db, "comments", post.postId!, "list");

  const openImageViewer = (index: number) => {
  setActiveImageIndex(index);
  };

  const closeImageViewer = () => {
    setActiveImageIndex(null);
  };

  const getCommentCount = async (postId: string): Promise<number> => {
  try {
    const snap = await getDocs(
      collection(db, "shared_post_comments", postId, "comments")
    );
    return snap.size;
  } catch (error) {
    console.error("Lỗi khi đếm comment:", error);
    return 0;
  }
};


  useEffect(() => {
  if (!user || !post.postId) return;

  const fetchState = async () => {
    try {
      const [likeSnap, postSnap, commentSnap] = await Promise.all([
        getDoc(likeDocRef),
        getDoc(postRef),
        getDocs(query(collection(db, "comments", post.postId!, "list"), orderBy("createdAt", "desc"))),
      ]);

      setIsLiked(likeSnap.exists());
      setLikeCount(postSnap.data()?.likes || 0);
      setShareCount(postSnap.data()?.shares || 0);
      setCommentCount(commentSnap.size); 
    } catch (err) {
      console.error("Lỗi khi load dữ liệu bài viết:", err);
    }
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
  const createdAt = post.createdAt ? new Date(post.createdAt) : null;
  const timeAgo = createdAt && !isNaN(createdAt.getTime()) 
    ? formatDistanceToNow(createdAt, { addSuffix: true, locale: vi }) 
    : "Ngày không hợp lệ";

  const ActionButton = ({ icon, count, onClick, active }: { icon: React.ReactNode; count: number; onClick: () => void; active?: boolean }) => (
    <button onClick={onClick} className="flex items-center gap-1 text-sm text-gray-700 hover:text-black">
      <span className={`text-lg ${active ? "text-red-500" : ""}`}>{icon}</span>
      <span>{count}</span>
    </button>
  );
  const imageArray: string[] = Array.isArray(post.imageUrls)
  ? post.imageUrls
  : typeof post.imageUrls === "string" && post.imageUrls !== ""
    ? [post.imageUrls]
    : [];
  
  const renderImages = () => {
  if (imageArray.length === 1) {
    return (
      <div className="mt-3">
        <div className="w-full aspect-video overflow-hidden rounded-md">
          <img
            src={imageArray[0]}
            alt="post-img-0"
            className="w-full h-full object-cover"
            onClick={() => openImageViewer(0)}
            onError={(e) => (e.currentTarget.src = "/broken-image.png")}
          />
        </div>
      </div>
    );
  }

  if (imageArray.length === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-2">
        {imageArray.map((url, index) => (
          <div key={index} className="aspect-square overflow-hidden rounded-md">
            <img
              src={url}
              alt={`post-img-${index}`}
              className="w-full h-full object-cover"
              onClick={() => openImageViewer(index)}
              onError={(e) => (e.currentTarget.src = "/broken-image.png")}
            />
          </div>
        ))}
      </div>
    );
  }

if (imageArray.length === 3) {
  return (
    <div className="mt-3 flex gap-2 h-[300px]">
      <div className="w-1/2 h-full overflow-hidden rounded-md">
        <img
          src={imageArray[0]}
          alt="img-0"
          className="w-full h-full object-cover rounded-md"
          onError={(e) => (e.currentTarget.src = "/broken-image.png")}
        />
      </div>

      <div className="w-1/2 flex flex-col gap-2 h-full">
        {[1, 2].map((index) => (
          <div key={index} className="flex-1 overflow-hidden rounded-md">
            <img
              src={imageArray[index]}
              alt={`img-${index}`}
              className="w-full h-full object-cover rounded-md"
              onClick={() => openImageViewer(index)}
              onError={(e) => (e.currentTarget.src = "/broken-image.png")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      {imageArray.slice(0, 4).map((url, index) => (
        <div key={index} className="aspect-square overflow-hidden rounded-md relative">
          <img
            src={url}
            alt={`post-img-${index}`}
            className="w-full h-full object-cover"
            onClick={() => openImageViewer(index)}
            onError={(e) => (e.currentTarget.src = "/broken-image.png")}
          />
          {index === 3 && imageArray.length > 4 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-md">
              <span className="text-white text-lg font-bold">
                +{imageArray.length - 4}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};


  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 mb-4" style={{ backgroundColor: isDarkMode ? "#163B25" : "#C8FAE4" }}>
      <div className="flex items-start gap-3">
        <img
          src={post.avatarUrl || "/default-avatar.png"}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-sm"
                style={{ color: isDarkMode ? "#FFFFFF" : "#000000" }}
              >{post.username || "Người dùng"}</p>
              <p className="text-xs text-gray-500">{timeAgo}</p>
            </div>
            <FiMoreVertical className="text-gray-600 cursor-pointer" 
                            style={{color: isDarkMode ? "#FFFFFF" : "#000000"}}
                            onClick={() => {
              if (user?.uid === post.uid && window.confirm("Bạn có muốn xóa bài viết này?")) {
                console.log("Trigger delete function");
              }
            }} />
          </div>

          {Array.isArray(post.tagList) && post.tagList.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {post.tagList.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: isDarkMode ? "#0e4d3a" : "#d1fae5",
                    color: isDarkMode ? "#ffffff" : "#065f46"
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {post.content && <p className="mt-1 text-sm whitespace-pre-line" style={{color: isDarkMode ? "#FFFFFF" : "#000000" }}>{post.content}</p>}
          
          {renderImages()}

          <div className="flex justify-around items-center mt-4 border-t pt-2 text-sm"  style={{color: isDarkMode ? "#FFFFFF" : "#000000" }}>
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
          const tags = Array.isArray(post.tagList) ? post.tagList.join(", ") : "";
          const text = `${post.content ?? ""}\n\n${tags ? `Chủ đề: ${tags}\n\n` : ""}(Chia sẻ từ Learnity)`;
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

      {activeImageIndex !== null && (
        <ImageViewerModal
          images={imageArray}
          index={activeImageIndex}
          onClose={closeImageViewer}
          onChangeIndex={(index) => setActiveImageIndex(index)}
        />
      )}

    </div>
  );
}
