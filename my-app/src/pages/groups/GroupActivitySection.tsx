import { type FC, type JSX } from "react";
import { FaRegNewspaper, FaUsers, FaUserFriends } from "react-icons/fa";

interface Props {
  postsTodayCount: number;
  membersInfo: string;
  creationInfo: string;
}

const ActivityItem: FC<{ icon: JSX.Element; text: string; subtitle?: string }> = ({ icon, text, subtitle }) => (
  <div className="flex gap-3 mb-3">
    <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded">
      {icon}
    </div>
    <div>
      <div className="font-medium text-black text-sm">{text}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  </div>
);

const GroupActivitySection: FC<Props> = ({ postsTodayCount, membersInfo, creationInfo }) => (
  <div className="bg-white p-5">
    <h2 className="text-lg font-bold text-black mb-4">Hoạt động trong nhóm</h2>
    <ActivityItem icon={<FaRegNewspaper className="text-gray-600" />} text={`${postsTodayCount} bài viết mới hôm nay`} />
    <ActivityItem icon={<FaUsers className="text-gray-600" />} text={membersInfo} />
    <ActivityItem icon={<FaUserFriends className="text-gray-600" />} text={creationInfo} />
  </div>
);

export default GroupActivitySection;
