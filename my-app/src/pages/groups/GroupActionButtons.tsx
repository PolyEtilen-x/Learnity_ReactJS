import { useState } from 'react';
import { FaUsers, FaUserShield, FaPlus } from 'react-icons/fa';

interface GroupActionButtonsProps {
  groupId: string;
  isLoading: boolean;
  isMember: boolean;
  isAdmin: boolean;
  isPreviewMode: boolean;
  groupPrivacy: string;
  onJoinGroup: () => void;
  onLeaveGroup: () => void;
  onInviteMember?: () => void;
  onManageGroup?: () => void;
}

const GroupActionButtons: React.FC<GroupActionButtonsProps> = ({
  groupId,
  isLoading,
  isMember,
  isAdmin,
  isPreviewMode,
  groupPrivacy,
  onJoinGroup,
  onLeaveGroup,
  onInviteMember,
  onManageGroup,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  if (isLoading) {
    return <div className="text-center py-4"><span className="loader" /></div>;
  }

  if (isPreviewMode) {
    return (
      <button
        className="bg-teal-200 text-black font-bold py-2 px-4 w-full rounded-lg"
        onClick={onJoinGroup}
      >
        {groupPrivacy === 'Riêng tư' ? 'Gửi yêu cầu tham gia' : 'Tham gia nhóm'}
      </button>
    );
  }

  if (isMember) {
    return (
      <div className="flex gap-3">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-full ${isAdmin ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-300 bg-gray-100 text-black'}`}
          >
            {isAdmin ? <FaUserShield /> : <FaUsers />}
            <span>{isAdmin ? 'Quản trị viên' : 'Đã tham gia'}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute z-10 bg-white border rounded shadow right-0 mt-2 w-48">
              {isAdmin && (
                <button
                  className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50"
                  onClick={() => { setShowMenu(false); onManageGroup?.(); }}
                >
                  Quản lý nhóm
                </button>
              )}
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100">Chia sẻ nhóm</button>
              {!isAdmin && (
                <>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100">Báo cáo nhóm</button>
                  <button
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
                    onClick={() => { setShowMenu(false); onLeaveGroup(); }}
                  >
                    Rời khỏi nhóm
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <button
          onClick={onInviteMember}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-700 text-black px-4 py-2 rounded-full shadow"
        >
          <FaPlus />
          Mời bạn
        </button>
      </div>
    );
  }

  return (
    <button
      className="bg-teal-200 text-black font-bold py-2 px-4 w-full rounded-lg"
      onClick={onJoinGroup}
    >
      {groupPrivacy === 'Riêng tư' ? 'Gửi yêu cầu tham gia' : 'Tham gia nhóm'}
    </button>
  );
};

export default GroupActionButtons;
