// GroupPage.tsx
import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  type DocumentData,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import type { GroupModel } from "../models/GroupModel";

const GroupPage: React.FC = () => {
  const [joinedGroups, setJoinedGroups] = useState<GroupModel[]>([]);
  const [availableGroups, setAvailableGroups] = useState<GroupModel[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [tab, setTab] = useState<"joined" | "available">("joined");
  const [loading, setLoading] = useState(true);
  const [searchJoined, setSearchJoined] = useState("");
  const [searchAvailable, setSearchAvailable] = useState("");

  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const fetchGroups = async () => {
    if (!user) return;
    setLoading(true);

    const snapshot = await getDocs(collection(db, "communityGroups"));
    const joined: GroupModel[] = [];
    const available: GroupModel[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      const membersList = data.membersList || [];
      const isMember = membersList.some((m: any) => m.uid === user.uid);
      const group: GroupModel = {
        id: doc.id,
        name: data.name,
        avatarUrl: data.avatarUrl || "",
        privacy: data.privacy,
        createdBy: data.createdBy,
        membersCount: data.membersCount || membersList.length || 0,
        createdAt: data.createdAt,
      };
      if (data.status === "active") {
        isMember ? joined.push(group) : available.push(group);
      }
    });

    joined.sort((a, b) => b.membersCount - a.membersCount);
    available.sort((a, b) => b.membersCount - a.membersCount);

    setJoinedGroups(joined);
    setAvailableGroups(available);
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, [user?.uid]);

  const renderGroupCard = (group: GroupModel, joined: boolean) => (
    <div
      key={group.id}
      className="border p-3 rounded mb-4 flex justify-between items-center"
    >
      <div>
        <p className="font-semibold">{group.name}</p>
        <p className="text-sm text-gray-600">
          {group.membersCount} thành viên • {group.privacy}
        </p>
      </div>
      <button
        className={`text-${joined ? "red" : "blue"}-500 font-medium`}
        onClick={() => alert(joined ? "Rời nhóm" : "Tham gia nhóm")}
      >
        {joined ? "Rời nhóm" : "Tham gia"}
      </button>
    </div>
  );

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-4">Nhóm</h1>
      <div className="flex justify-center gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            tab === "joined" ? "bg-black text-white" : "bg-gray-200"
          }`}
          onClick={() => setTab("joined")}
        >
          Đã tham gia
        </button>
        <button
          className={`px-4 py-2 rounded ${
            tab === "available" ? "bg-black text-white" : "bg-gray-200"
          }`}
          onClick={() => setTab("available")}
        >
          Chưa tham gia
        </button>
      </div>

      {loading ? (
        <p className="text-center">Đang tải dữ liệu...</p>
      ) : tab === "joined" ? (
        <div>
          <input
            type="text"
            className="w-full p-2 mb-4 border rounded"
            placeholder="Tìm kiếm nhóm đã tham gia"
            value={searchJoined}
            onChange={(e) => setSearchJoined(e.target.value)}
          />
          {joinedGroups
            .filter((g) => g.name.toLowerCase().includes(searchJoined.toLowerCase()))
            .map((group) => renderGroupCard(group, true))}
        </div>
      ) : (
        <div>
          <input
            type="text"
            className="w-full p-2 mb-4 border rounded"
            placeholder="Tìm kiếm nhóm để tham gia"
            value={searchAvailable}
            onChange={(e) => setSearchAvailable(e.target.value)}
          />
          {availableGroups
            .filter((g) => g.name.toLowerCase().includes(searchAvailable.toLowerCase()))
            .map((group) => renderGroupCard(group, false))}
        </div>
      )}
    </div>
  );
};

export default GroupPage;