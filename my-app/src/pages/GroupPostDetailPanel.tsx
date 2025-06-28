import { createPortal } from "react-dom";
import { Heart, MessageCircle, Share2, X } from "lucide-react";
import {
  doc, getDoc, updateDoc, arrayUnion, arrayRemove,
  collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, increment
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useEffect, useState } from "react";
import { type GroupPostModel } from "../models/GroupPostModel";
import { getAuth } from "firebase/auth";

interface Props {
  groupId: string;
  post: GroupPostModel;
  onClose: () => void;
}

export default function GroupPostDetailPanel({ groupId, post, onClose }: Props) {
  const auth = getAuth();
  const user = auth.currentUser;

  const [comments, setComments] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(post.likedBy.length);
  const [shareCount, setShareCount] = useState(post.sharesCount);

  const postRef = doc(db, "communityGroups", groupId, "posts", post.postId);
  const commentsRef = collection(postRef, "comments");

  useEffect(() => {
    const unsubscribe = onSnapshot(query(commentsRef, orderBy("createdAt", "desc")), (snapshot) => {
      setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const handleLike = async () => {
    if (!user) return;
    await updateDoc(postRef, {
      likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
    setIsLiked(!isLiked);
    setLikeCount((prev) => isLiked ? prev - 1 : prev + 1);
  };

  const handleComment = async () => {
    if (!user || !input.trim()) return;

    const userSnap = await getDoc(doc(db, "users", user.uid));
    const userData = userSnap.exists() ? userSnap.data() : {};

    await addDoc(commentsRef, {
      authorUid: user.uid,
      authorUsername: userData?.username || user.displayName || "Người dùng",
      authorAvatarUrl: userData?.avatarUrl || user.photoURL || "",
      content: input.trim(),
      createdAt: serverTimestamp(),
    });

    await updateDoc(postRef, {
      commentsCount: increment(1),
    });

    setInput("");
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-auto rounded-lg shadow-xl p-5 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-black">
          <X />
        </button>

        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <img src={post.authorAvatarUrl || "/default-avatar.png"} className="w-10 h-10 rounded-full" />
            <h2 className="text-lg font-bold">{post.authorUsername}</h2>
          </div>
          {post.title && <p className="font-semibold text-black mb-1">{post.title}</p>}
          <p>{post.text}</p>
          {post.imageUrl && <img src={post.imageUrl} className="w-full mt-3 rounded" />}
        </div>

        <div className="flex gap-6 items-center text-sm text-gray-600 my-4">
          <button onClick={handleLike} className="flex items-center gap-1">
            <Heart size={18} fill={isLiked ? "red" : "none"} stroke={isLiked ? "red" : "currentColor"} />
            <span>{likeCount}</span>
          </button>
          <div className="flex items-center gap-1">
            <MessageCircle size={18} />
            <span>{comments.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <Share2 size={18} />
            <span>{shareCount}</span>
          </div>
        </div>

        <div className="border-t pt-3">
          <h3 className="font-semibold mb-2">Bình luận</h3>
          <div className="space-y-3 mb-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2 items-start">
                <img src={c.authorAvatarUrl || "/default-avatar.png"} className="w-8 h-8 rounded-full" />
                <div>
                  <p className="text-sm font-semibold">{c.authorUsername}</p>
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
            <button onClick={handleComment} className="bg-blue-600 text-black px-4 py-1 rounded">
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
