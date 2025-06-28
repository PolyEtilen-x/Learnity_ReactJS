import { Timestamp, type DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { auth } from "../firebaseConfig"; // Đường dẫn tới firebase config của bạn

export interface GroupPostModel {
  postId: string;
  groupId: string;
  authorUid: string;
  authorUsername?: string;
  authorAvatarUrl?: string;
  title?: string;
  text?: string;
  imageUrl?: string;
  likedBy: string[];
  commentsCount: number;
  sharesCount: number;
  createdAt: Date;
  isLikedByCurrentUser: boolean;
}

export function groupPostFromDocument(doc: QueryDocumentSnapshot<DocumentData>): GroupPostModel {
  const data = doc.data();
  const currentUser = auth.currentUser;
  const likedByList: string[] = data.likedBy ?? [];

  return {
    postId: doc.id,
    groupId: data.groupId ?? "",
    authorUid: data.authorUid ?? "",
    authorUsername: data.authorUsername ?? "",
    authorAvatarUrl: data.authorAvatarUrl ?? "",
    title: data.title ?? "",
    text: data.text ?? "",
    imageUrl: data.imageUrl ?? "",
    likedBy: likedByList,
    commentsCount: data.commentsCount ?? 0,
    sharesCount: data.sharesCount ?? 0,
    createdAt: (data.createdAt?.toDate?.() ?? new Date()) as Date,
    isLikedByCurrentUser: currentUser ? likedByList.includes(currentUser.uid) : false,
  };
}

export function groupPostToMap(post: GroupPostModel): Record<string, any> {
  return {
    groupId: post.groupId,
    authorUid: post.authorUid,
    authorUsername: post.authorUsername,
    authorAvatarUrl: post.authorAvatarUrl,
    title: post.title,
    text: post.text,
    imageUrl: post.imageUrl,
    likedBy: post.likedBy,
    commentsCount: post.commentsCount,
    sharesCount: post.sharesCount,
    createdAt: Timestamp.fromDate(post.createdAt),
  };
}
