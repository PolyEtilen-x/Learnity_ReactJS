import React from "react";
import { FiMoreVertical, FiTrash2, FiHeart, FiMessageCircle, FiShare2 } from "react-icons/fi";
import { auth } from "../../firebaseConfig";

interface GroupPostCardProps {
  userName: string;
  userAvatarUrl: string;
  postTitle?: string;
  postText: string;
  postImageUrl?: string;
  timestamp: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLikedByCurrentUser: boolean;
  onLikePressed: () => void;
  onCommentPressed: () => void;
  onSharePressed: () => void;
  postAuthorUid: string;
  onDeletePost: () => void;
}

const GroupPostCard: React.FC<GroupPostCardProps> = ({
  userName,
  userAvatarUrl,
  postTitle,
  postText,
  postImageUrl,
  timestamp,
  likesCount,
  commentsCount,
  sharesCount,
  isLikedByCurrentUser,
  onLikePressed,
  onCommentPressed,
  onSharePressed,
  postAuthorUid,
  onDeletePost,
}) => {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (currentUser?.uid === postAuthorUid) {
      const menu = window.confirm("Bạn có muốn xóa bài viết này?");
      if (menu) onDeletePost();
    }
  };

  const ActionButton = ({ icon, count, onClick, active }: { icon: React.ReactNode; count: number; onClick: () => void; active?: boolean }) => (
    <button onClick={onClick} className="flex items-center gap-1 text-sm text-gray-700 hover:text-black">
      <span className={`text-lg ${active ? "text-red-500" : ""}`}>{icon}</span>
      <span>{count}</span>
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 mb-4" onContextMenu={handleContextMenu}>
      <div className="flex items-start gap-3">
        <img src={userAvatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-sm">{userName}</p>
              <p className="text-xs text-gray-500">{timestamp}</p>
            </div>
            <FiMoreVertical className="text-gray-600 cursor-pointer" onClick={handleContextMenu} />
          </div>
          {postTitle && <p className="font-bold mt-2 text-base">{postTitle}</p>}
          {postText && <p className="mt-1 text-sm text-gray-800 whitespace-pre-line">{postText}</p>}
          {postImageUrl && (
            <div className="mt-3">
              <img
                src={postImageUrl}
                alt="post"
                className="rounded-md w-full max-h-[300px] object-cover"
                onError={(e) => (e.currentTarget.src = "/broken-image.png")}
              />
            </div>
          )}
          <div className="flex justify-around items-center mt-4 border-t pt-2 text-sm">
            <ActionButton icon={isLikedByCurrentUser ? <FiHeart fill="red" /> : <FiHeart />} count={likesCount} onClick={onLikePressed} active={isLikedByCurrentUser} />
            <ActionButton icon={<FiMessageCircle />} count={commentsCount} onClick={onCommentPressed} />
            <ActionButton icon={<FiShare2 />} count={sharesCount} onClick={onSharePressed} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupPostCard;
