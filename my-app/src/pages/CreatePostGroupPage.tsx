import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { uploadImageToCloudinary } from "../utils/uploadtoCloudinary";
import { FiImage } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";

export default function CreateGroupPostPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !groupId || !text.trim()) {
      alert("Vui lòng nhập nội dung bài viết.");
      return;
    }

    setLoading(true);
    const postId = uuidv4(); // hoặc dùng Firestore doc ID nếu muốn

    let imageUrl = "";

    try {
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(
          imageFile,
          `Learnity/GroupPosts/${groupId}/${postId}`
        );
      }

      const postData = {
        postId,
        groupId,
        authorUid: user.uid,
        authorUsername: user.username,
        authorAvatarUrl: user.avatarUrl,
        title: title.trim(),
        text: text.trim(),
        imageUrl,
        likedBy: [],
        commentsCount: 0,
        sharesCount: 0,
        createdAt: Timestamp.now(),
        isLikedByCurrentUser: false,
      };

      const postRef = doc(db, "communityGroups", groupId, "posts", postId);
      await setDoc(postRef, postData);

      navigate(`/groups/${groupId}`);
    } catch (error) {
      console.error("Lỗi khi tạo bài viết nhóm:", error);
      alert("Không thể tạo bài viết.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Tạo bài viết nhóm</h2>

      <input
        type="text"
        className="w-full border p-2 mb-3 rounded"
        placeholder="Tiêu đề (tùy chọn)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full border p-2 mb-3 rounded"
        placeholder="Nội dung bài viết"
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex items-center gap-3 mb-4">
        <label htmlFor="imageInput" className="cursor-pointer">
          <FiImage size={24} />
        </label>
        <input
          id="imageInput"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />
        {imageFile && <span>{imageFile.name}</span>}
      </div>

      <button
        className="bg-green-600 text-black px-4 py-2 rounded hover:bg-green-700 border-2 border-blue-500 transition-colors duration-200"
        disabled={loading}
        onClick={handleSubmit}
      >
        {loading ? "Đang đăng..." : "Đăng bài"}
      </button>
    </div>
  );
}
