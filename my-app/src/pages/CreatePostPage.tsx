import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { collection, addDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { uploadImageToCloudinary } from "../utils/uploadtoCloudinary";
import { FiImage } from "react-icons/fi";
import { IoClose } from "react-icons/io5";

export default function CreatePostPage() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const maxImages = 10;
  const maxTags = 3;

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const snapshot = await getDocs(collection(db, "post_tags"));
        const tags = snapshot.docs
          .map(doc => doc.data()?.name)
          .filter((tag): tag is string => typeof tag === "string");
        setAvailableTags(tags);
      } catch (error) {
        console.error("Lỗi khi tải tags:", error);
      }
    };

    fetchTags();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, maxImages - images.length);
    setImages((prev) => [...prev, ...newFiles]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else if (selectedTags.length < maxTags) {
      setSelectedTags((prev) => [...prev, tag]);
    } else {
      alert("Bạn chỉ được chọn tối đa 3 chủ đề.");
    }
  };

  const handleAddCustomTag = () => {
    const tag = customTag.trim();
    if (tag && !selectedTags.includes(tag)) {
      toggleTag(tag);
      setCustomTag("");
    }
  };

  const handleSubmit = async () => {
    if (!selectedTags.length || !content.trim()) {
      alert("Vui lòng chọn ít nhất một chủ đề và nhập nội dung.");
      return;
    }

    if (!user?.uid) return;

    setLoading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const img of images) {
        const url = await uploadImageToCloudinary(img);
        if (url) uploadedUrls.push(url);
      }

      const newPost = {
        tagList: selectedTags,
        content,
        imageUrls: uploadedUrls,
        createdAt: new Date(),
        uid: user.uid,
        username: user.username,
        avatarUrl: user.avatarUrl,
        isVerified: false,
        isLiked: false,
        isHidden: false,
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
      alert("Lỗi khi đăng bài viết.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Tạo bài đăng mới</h2>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Chọn chủ đề (tối đa 3)</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm border ${
                selectedTags.includes(tag)
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="Thêm chủ đề..."
            className="flex-1 p-2 border rounded"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
          />
          <button
            onClick={handleAddCustomTag}
            className="bg-green-600 text-white px-4 rounded hover:bg-green-700"
          >
            Thêm
          </button>
        </div>

        {/* Hiển thị chủ đề đã chọn */}
        {selectedTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {tag}
                <button onClick={() => toggleTag(tag)} className="text-blue-600">
                  <IoClose />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nội dung */}
      <textarea
        placeholder="Nội dung bài viết..."
        className="w-full p-2 mb-3 border rounded"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
      ></textarea>

      {/* Hình ảnh */}
      <div className="mb-4">
        <label htmlFor="imageUpload" className="cursor-pointer flex items-center gap-2">
          <FiImage size={24} />
          <span>Thêm ảnh ({images.length}/{maxImages})</span>
        </label>
        <input
          id="imageUpload"
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>

      {/* Preview ảnh */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          {images.map((img, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(img)}
                alt={`upload-${index}`}
                className="w-full h-32 object-cover rounded"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-black bg-opacity-60 rounded-full p-1"
              >
                <IoClose className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Đang đăng..." : "Đăng bài"}
      </button>
    </div>
  );
}
