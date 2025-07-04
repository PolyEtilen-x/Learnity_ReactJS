import { useEffect, useState } from 'react';
import { FaCamera, FaMicrophone, FaPhotoVideo, FaUser } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

interface CreatePostBarProps {
  currentUserAvatarUrl?: string;
}

const CreatePostBar: React.FC<CreatePostBarProps> = ({ currentUserAvatarUrl }) => {
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  const navigate = useNavigate();
  const { groupId } = useParams(); // lấy groupId từ URL

  useEffect(() => {
    setTimeout(() => {
      setAvatarUrl(currentUserAvatarUrl);
      setIsLoadingAvatar(false);
    }, 500);
  }, [currentUserAvatarUrl]);

  const handleNavigateToCreatePost = () => {
    if (groupId) {
      navigate(`/groups/${groupId}/create-post`);
    } else {
      alert("Không tìm thấy groupId.");
    }
  };

  return (
    <div className="p-3 bg-white rounded-lg border border-gray-300 shadow-sm flex items-center">
      {isLoadingAvatar ? (
        <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse" />
      ) : (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              <FaUser size={20} />
            </div>
          )}
        </div>
      )}
      <input
        readOnly
        onClick={handleNavigateToCreatePost}
        placeholder="Hãy đăng một gì đó lên nhóm của bạn?"
        className="flex-1 ml-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none cursor-pointer"
      />
      <div className="flex gap-2 ml-4">
        <button onClick={handleNavigateToCreatePost}><FaPhotoVideo className="text-green-600" /></button>
        <button onClick={handleNavigateToCreatePost}><FaCamera className="text-blue-600" /></button>
        <button onClick={handleNavigateToCreatePost}><FaMicrophone className="text-red-600" /></button>
      </div>
    </div>
  );
};

export default CreatePostBar;
