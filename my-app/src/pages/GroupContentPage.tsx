import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  deleteDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  setDoc,
  increment,
} from "firebase/firestore";
import { 
    getStorage, 
    ref, 
    deleteObject 
} from "firebase/storage";
import { getAuth } from "firebase/auth";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import GroupActivitySection from "../pages/groups/GroupActivitySection";
import GroupActionButtons from "../pages/groups/GroupActionButtons";
import CreatePostBar from "../pages/groups/CreatePostBar";
import GroupPostCard from "../pages/groups/GroupPostCard";

import type { GroupPostModel } from "../models/GroupPostModel";
import GroupPostDetailPanel from "./GroupPostDetailPanel";

export default function GroupContentPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const db = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [groupData, setGroupData] = useState<any>(null);
  const [posts, setPosts] = useState<GroupPostModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<GroupPostModel | null>(null);


  const handleDeletePost = async (postId: string, imageUrl: string | undefined) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa bài viết này?");
    if (!confirmDelete || !currentUser || !groupId) return;

    try {
        const postRef = doc(db, "communityGroups", groupId, "posts", postId);
        const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
    alert("Bài viết không tồn tại.");
    return;
    }

    const data = postSnap.data();
        if (data.authorUid !== currentUser.uid) {
        alert("Bạn không có quyền xóa bài viết này.");
        return;
        }

        if (imageUrl) {
        try {
            const storage = getStorage();
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
        } catch (err) {
            console.warn("Không xóa được ảnh, nhưng vẫn tiếp tục:", err);
        }
        }

        await deleteDoc(postRef);
        setPosts((prev) => prev.filter((p) => p.postId !== postId));

        } catch (error) {
            console.error("Lỗi khi xóa bài viết:", error);
            alert("Xóa bài viết thất bại.");
        }
    };

    const handleToggleLikePost = async (postId: string, currentLikeStatus: boolean) => {
        if (!currentUser || !groupId) return;

        const postRef = doc(db, "communityGroups", groupId, "posts", postId);

        try {
            if (currentLikeStatus) {
            await updateDoc(postRef, {
                likedBy: arrayRemove(currentUser.uid),
            });
            } else {
            await updateDoc(postRef, {
                likedBy: arrayUnion(currentUser.uid),
            });
            }

            setPosts((prevPosts) =>
            prevPosts.map((p) =>
                p.postId === postId
                ? {
                    ...p,
                    likedBy: currentLikeStatus
                        ? p.likedBy.filter((uid) => uid !== currentUser.uid)
                        : [...p.likedBy, currentUser.uid],
                    isLikedByCurrentUser: !currentLikeStatus,
                    }
                : p
            )
            );
        } catch (error) {
            console.error("Lỗi khi like/unlike:", error);
        }
    };
    const handleSharePost = async (post: GroupPostModel) => {
        if (!currentUser || !groupId || !groupData) return;

        try {
            const sharedPostRef = doc(collection(db, "shared_posts"));
            const newPostId = sharedPostRef.id;

            const postRef = doc(db, "communityGroups", groupId, "posts", post.postId);
            await updateDoc(postRef, { sharesCount: increment(1) });

            const userSnap = await getDoc(doc(db, "users", currentUser.uid));
            const userData = userSnap.exists() ? userSnap.data() : {};

            const sharedPostData = {
                postId: newPostId,
                title: post.title,
                text: post.text,
                imageUrl: post.imageUrl,
                originUserId: post.authorUid,
                sharerUserId: currentUser.uid,
                authorUsername: userData?.username || currentUser.displayName || "Không tên",
                authorAvatarUrl: userData?.avatarUrl || currentUser.photoURL || "",
                sharedAt: Timestamp.now(),
                commentsCount: 0,
                sharesCount: 0,
                isSharedPost: true,
                sharedInfo: {
                    originalPostId: post.postId,
                    originalAuthorUid: post.authorUid,
                    originalAuthorUsername: post.authorUsername,
                    originalGroupId: groupId,
                    originalGroupName: groupData.name,
                },
            };

            await setDoc(sharedPostRef, sharedPostData);

            alert("Đã chia sẻ bài viết!");
            } catch (error) {
                console.error("Lỗi khi chia sẻ:", error);
                alert("Không thể chia sẻ bài viết.");
            }
    };


  useEffect(() => {
    if (!groupId || !currentUser) return;
    const fetchData = async () => {
      setIsLoading(true);
      const groupRef = doc(db, "communityGroups", groupId);
      const groupSnap = await getDoc(groupRef);

      if (!groupSnap.exists()) {
        setGroupData(null);
        setPosts([]);
        setIsLoading(false);
        return;
      }

      const data = groupSnap.data();
      const membersList = (data.membersList || []).map((m: any) => ({ ...m }));

      const memberData = membersList.find((m: any) => m.uid === currentUser.uid);
      const isMember = !!memberData;
      const isAdmin = memberData?.isAdmin === true;

      const postsRef = collection(db, "communityGroups", groupId, "posts");
      const postSnap = await getDocs(query(postsRef, orderBy("createdAt", "desc")));

      const recentPosts = postSnap.docs.map((doc) => {
        const postData = doc.data();
        const likedBy = postData.likedBy || [];
        return {
            postId: doc.id,
            groupId: groupId,
            authorUid: postData.authorUid,
            authorUsername: postData.authorUsername,
            authorAvatarUrl: postData.authorAvatarUrl,
            title: postData.title || "",
            text: postData.text || "",
            imageUrl: postData.imageUrl,
            likedBy,
            commentsCount: postData.commentsCount || 0,
            sharesCount: postData.sharesCount || 0,
            createdAt: (postData.createdAt as Timestamp)?.toDate() || new Date(),
            isLikedByCurrentUser: currentUser ? likedBy.includes(currentUser.uid) : false,
            } as GroupPostModel;
        });

      setGroupData(data);
      setPosts(recentPosts);
      setIsLoading(false);
    };
    console.log("groupId:", groupId);

    fetchData();
  }, [groupId]);

  if (isLoading) return <div className="text-center mt-10">Đang tải...</div>;
  if (!groupData) return <div className="text-center mt-10">Không tìm thấy nhóm</div>;

  const postsTodayCount = posts.filter((p) => {
    const now = new Date();
    return (
        p.createdAt.getDate() === now.getDate() &&
        p.createdAt.getMonth() === now.getMonth() &&
        p.createdAt.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="max-w-3xl mx-auto p-4">
        <div className="rounded overflow-hidden mb-4">
            <img
                src={groupData.avatarUrl || "/default-avatar.png"}
                alt="group"
                className="w-full h-64 object-cover"
            />
            </div>
            <h2 className="text-2xl font-bold mb-1">{groupData.name}</h2>
            <p className="text-gray-500 mb-2">
                {groupData.privacy} • {groupData.membersCount || 0} thành viên
            </p>

            <div className="mb-4">
                <GroupActionButtons
                    groupId={groupId!}
                    isLoading={false}
                    isMember={true}
                    isAdmin={false}
                    isPreviewMode={false}
                    groupPrivacy={groupData.privacy}
                    onJoinGroup={() => alert("Join Group")}
                    onLeaveGroup={() => alert("Leave Group")}
                    onInviteMember={() => alert("Invite Member")}
                    onManageGroup={() => alert("Manage Group")}
                />
            </div>

            <div className="mb-4">
                <CreatePostBar currentUserAvatarUrl={currentUser?.photoURL || ""} />
            </div>

        <div className="mb-6">
            <GroupActivitySection
                postsTodayCount={postsTodayCount}
                membersInfo={`Tổng số ${groupData.membersCount || 0} thành viên`}
                creationInfo={groupData.createdAt ? `Tạo ngày: ${format(groupData.createdAt.toDate?.() || new Date(groupData.createdAt), "dd/MM/yyyy")}` : "Tạo ngày: không rõ"}
            />
        </div>

        <div className="space-y-6">
            {posts.length === 0 ? (
                <p className="text-center text-gray-500">Chưa có bài viết nào trong nhóm này.</p>
            ) : (
                posts.map((post) => (
                    <GroupPostCard
                        key={post.postId}
                        userName={post.authorUsername || "Người dùng"}
                        userAvatarUrl={post.authorAvatarUrl || "/default-avatar.png"}
                        postTitle={post.title}
                        postText={post.text}
                        postImageUrl={post.imageUrl}
                        timestamp={format(post.createdAt, "d MMM, HH:mm", { locale: vi })}
                        likesCount={post.likedBy.length}
                        commentsCount={post.commentsCount}
                        sharesCount={post.sharesCount}
                        isLikedByCurrentUser={post.isLikedByCurrentUser}
                        onLikePressed={() => handleToggleLikePost(post.postId, post.isLikedByCurrentUser)}
                        postAuthorUid={post.authorUid}
                        onDeletePost={() => handleDeletePost(post.postId, post.imageUrl)}  
                        onClick={() => setSelectedPost(post)} 
                        onSharePressed={() => handleSharePost(post)}
                    />
                ))
            )}
        </div>
        {selectedPost && (
            <GroupPostDetailPanel
                groupId={groupId!}
                post={selectedPost}
                onClose={() => setSelectedPost(null)}
            />
            )}
    </div>
  );
}
