import { db } from "../firebaseConfig";
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  writeBatch,
} from "firebase/firestore";
import { uploadImageToCloudinary } from "../utils/uploadtoCloudinary";
import type { GroupPostModel } from "../models/GroupPostModel";

export async function createPostInGroup({
  groupId,
  title,
  text,
  imageFile,
}: {
  groupId: string;
  title?: string;
  text?: string;
  imageFile?: File;
}): Promise<"approved" | "pending" | null> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    console.error("Lỗi: Người dùng chưa đăng nhập.");
    return null;
  }

  const postId = doc(collection(db, "communityGroups", groupId, "posts")).id;

  try {
    const groupSnap = await getDoc(doc(db, "communityGroups", groupId));
    if (!groupSnap.exists()) {
      console.error("Không tìm thấy nhóm với ID:", groupId);
      return null;
    }

    const groupData = groupSnap.data();
    const isPrivateGroup = groupData?.privacy === "Riêng tư";
    const membersList = groupData?.membersList || [];

    const memberData = membersList.find((m: any) => m.uid === user.uid);
    const isUserAdmin = memberData?.isAdmin === true;
    const needsApproval = isPrivateGroup && !isUserAdmin;

    let uploadedImageUrl = "";
    if (imageFile) {
        uploadedImageUrl = await uploadImageToCloudinary(
            imageFile,
            `Learnity/GroupPosts/${groupId}/${postId}`
        );

        if (!uploadedImageUrl) {
            console.error("Upload ảnh thất bại");
            return null;
        }
    }

    const userSnap = await getDoc(doc(db, "users", user.uid));
    const userData = userSnap.exists() ? userSnap.data() : {};
    const authorUsername = userData?.username || user.displayName || "Người dùng";
    const authorAvatarUrl = userData?.avatarUrl || user.photoURL || "";

    const post: GroupPostModel = {
      postId,
      groupId,
      authorUid: user.uid,
      authorUsername,
      authorAvatarUrl,
      title: title?.trim() || "",
      text: text?.trim() || "",
      imageUrl: uploadedImageUrl,
      likedBy: [],
      commentsCount: 0,
      sharesCount: 0,
      createdAt: new Date(),
      isLikedByCurrentUser: false,
    };

    if (needsApproval) {
      const pendingRef = doc(db, "communityGroups", groupId, "pendingPosts", postId);
      await setDoc(pendingRef, post);
      return "pending";
    } else {
      const postRef = doc(db, "communityGroups", groupId, "posts", postId);
      const groupRef = doc(db, "communityGroups", groupId);

      const batch = writeBatch(db);
      batch.set(postRef, post);
      batch.update(groupRef, { postsCount: increment(1) });

      await batch.commit();
      return "approved";
    }
  } catch (error) {
    console.error("🔥 Lỗi trong createPostInGroup:", error);
    return null;
  }
}
