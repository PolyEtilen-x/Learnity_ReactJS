import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Notification_API from "../../services/NotificationAPI"; 
import { useNavigate } from "react-router-dom";
import { AppBackgroundStyles, AppTextStyles } from "../../theme/theme";
import { useTheme } from "../../theme/ThemeProvider";

export default function InviteMemberPage() {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const db = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const { isDarkMode } = useTheme();

  const [followers, setFollowers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [existingMembers, setExistingMembers] = useState<string[]>([]);
  const [invitedMembers, setInvitedMembers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    if (!groupId || !currentUser) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const groupRef = doc(db, "communityGroups", groupId);
        const groupSnap = await getDoc(groupRef);
        if (groupSnap.exists()) {
          const groupData = groupSnap.data();
          setExistingMembers(groupData.membersList || []);
          setGroupName(groupData.name || "Unknown Group");
        }

        const inviteQuery = query(
          collection(db, "invite_member_notifications"),
          where("senderId", "==", currentUser.uid),
          where("groupId", "==", groupId)
        );
        const inviteSnap = await getDocs(inviteQuery);
        setInvitedMembers(inviteSnap.docs.map((doc) => doc.data().receiverId));

        const followersRef = collection(db, "users");
        const followersSnap = await getDocs(followersRef);
        const followersList = followersSnap.docs.map((doc) => doc.data());
        setFollowers(followersList);
      } catch (error) {
        console.error("Error fetching data:", error);
        setStatusMessage("Failed to fetch data.");
      }
      setIsLoading(false);
    };

    fetchData();
  }, [groupId, currentUser]);

  const filteredFollowers = followers.filter((follower) => {
    if (searchQuery) {
      const name = follower.name?.toLowerCase() || "";
      const email = follower.email?.toLowerCase() || "";
      return (
        (name.includes(searchQuery.toLowerCase()) ||
          email.includes(searchQuery.toLowerCase())) &&
        !existingMembers.includes(follower.id) &&
        !invitedMembers.includes(follower.id)
      );
    }
    return !existingMembers.includes(follower.id) && !invitedMembers.includes(follower.id);
  });

  const handleInvite = async () => {
    if (!currentUser || selectedMembers.length === 0) return;

    setIsInviting(true);
    setStatusMessage("Inviting members...");

    try {
      const newInvites: string[] = [];
      const alreadyInvited = [];

      for (const memberId of selectedMembers) {
        const existingInvite = await getDocs(
          query(
            collection(db, "invite_member_notifications"),
            where("senderId", "==", currentUser.uid),
            where("receiverId", "==", memberId),
            where("groupId", "==", groupId)
          )
        );

        if (existingInvite.empty) {
          newInvites.push(memberId);
        } else {
          alreadyInvited.push(memberId);
        }
      }

      const notificationPromises = newInvites.map(async (memberId) => {
        const senderName = currentUser.displayName || currentUser.email || "Người dùng";
        await Notification_API.sendInviteMemberNotification(
          senderName,
          memberId,
          groupId!,
          groupName
        );
      });

      await Promise.all(notificationPromises);

      setInvitedMembers((prev) => [...prev, ...newInvites]);

      if (alreadyInvited.length > 0) {
        setStatusMessage(`The following members were already invited: ${alreadyInvited.join(", ")}`);
      } else {
        setStatusMessage(`Successfully invited ${newInvites.length} member(s)`);
      }

      setIsInviting(false);
    } catch (error) {
      console.error("Error inviting members:", error);
      setStatusMessage("Error inviting members.");
      setIsInviting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-blue-50 max-w-2xl w-full max-h-[90vh] overflow-auto rounded-lg shadow-xl p-5 relative">
        <div className="mb-4">
          <input
            type="text"
            className="border rounded p-2 w-full"
            style={{
              backgroundColor: isDarkMode ? "#C0C0C0" : "#C9C9C9",
              color: isDarkMode ? "#FFFFFF" : "#000000",
              borderColor: isDarkMode ? "#444444" : "#CCCCCC"
            }}
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mb-4" style={{ color: isDarkMode ? "#000000" : "#ffffff" }}>
          <button
            className="bg-blue-500 px-4 py-2 rounded"
            onClick={handleInvite}
            disabled={isInviting}
          >
            {isInviting ? "Inviting..." : `Invite (${selectedMembers.length})`}
          </button>
        </div>

        {statusMessage && <div className="text-center mb-4">{statusMessage}</div>}

        <div className="space-y-4">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            filteredFollowers.map((follower) => (
              <div key={follower.id} className="flex justify-between items-center">
                <div>
                  <span><img src={follower.avatarUrl || "/default-avatar.png"} alt={follower.displayName} className="w-8 h-8 rounded-full" /></span>
                  <span style={{ color: isDarkMode ? "#000" : "#fff" }}>
                    {follower.name || follower.displayName}
                  </span>
                </div>
                <button
                  className="text-blue-500"
                  onClick={() => {
                    if (selectedMembers.includes(follower.id)) {
                      setSelectedMembers((prev) => prev.filter((id) => id !== follower.id));
                    } else {
                      setSelectedMembers((prev) => [...prev, follower.id]);
                    }
                  }}
                >
                  {selectedMembers.includes(follower.id) ? "Deselect" : "Select"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
