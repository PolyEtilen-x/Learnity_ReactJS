import { useState } from "react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { db } from "../firebaseConfig";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { uploadImageToCloudinary } from "../utils/uploadtoCloudinary";
import { FiImage } from "react-icons/fi";
import { is } from "date-fns/locale";

export default function CreatePostPage() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Vui lòng nhập tiêu đề và nội dung bài viết.");
      return;
    }

    if (!user?.uid) return;

    setLoading(true);
    let imageUrl = "";

    try {
      if (image) {
        const uploadedUrl = await uploadImageToCloudinary(image);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const newPost = {
        postDescription: title,
        content,
        imageUrl,
        createdAt: new Date(),
        uid: user.uid,
        username: user.username,
        avatarUrl: user.avatarUrl,
        isVerified: false,
        isLiked: false,
        likes: 0,
        comments: 0,
        shares: 0,
        likedBy: [] as string[],
      };

      const docRef = await addDoc(collection(db, "posts"), newPost);

      await updateDoc(doc(db, "posts", docRef.id), {
        postId: docRef.id,
      });

      navigate("/home");
    } catch (error) {
      console.error("🔥 Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto"
      style={{color: is ? "#FFFFFF" : "#000000"}}>
      <h2 className="text-2xl font-bold mb-4">Tạo bài đăng mới</h2>
      <input
        type="text"
        placeholder="Tiêu đề bài đăng"
        className="w-full p-2 mb-3 border rounded"
        style={{ color: is ? "#FFFFFF" : "#000000" }}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Nội dung"
        className="w-full p-2 mb-3 border rounded"
        value={content}
        style={{ color: is ? "#FFFFFF" : "#000000" }}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      ></textarea>

      <div className="mb-4" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <label htmlFor="imageUpload" className="cursor-pointer">
          <FiImage size={40} />
        </label>
        <input
          style={{ fontSize: "20px", lineHeight: "40px" }}
          id="imageUpload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-black text-black px-6 py-2 rounded hover:opacity-80"
      >
        {loading ? "Đang đăng..." : "Đăng bài"}
      </button>
    </div>
  );
}