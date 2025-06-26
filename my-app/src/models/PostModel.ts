import { Timestamp, type DocumentData, DocumentSnapshot } from "firebase/firestore";

export interface PostModel {
  postId?: string;
  username?: string;
  avatarUrl?: string;
  isVerified: boolean;
  postDescription?: string;
  content?: string;
  imageUrl?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  uid?: string;
  createdAt: Date;
  isLiked: boolean;
  sharedByUid?: string;
}

export const createEmptyPost = (): PostModel => ({
  postId: "",
  username: "",
  avatarUrl: "",
  isVerified: false,
  postDescription: "",
  content: "",
  imageUrl: "",
  likes: 0,
  comments: 0,
  shares: 0,
  uid: "",
  createdAt: new Date(),
  isLiked: false,
});

export const postFromFirestore = (data: any, docId?: string): PostModel => ({
  postId: docId ?? data.postId ?? "",
  username: data.username ?? "",
  avatarUrl: data.avatarUrl ?? "",
  isVerified: data.isVerified ?? false,
  postDescription: data.postDescription ?? "",
  content: data.content ?? "",
  imageUrl: data.imageUrl ?? "",
  likes: data.likes ?? 0,
  comments: data.comments ?? 0,
  shares: data.shares ?? 0,
  uid: data.uid ?? "",
  sharedByUid: data.sharedByUid ?? "",
  createdAt: (data.createdAt instanceof Timestamp)
    ? data.createdAt.toDate()
    : new Date(),
  isLiked: data.isLiked ?? false,
});

export const postFromDocument = (doc: DocumentSnapshot<DocumentData>): PostModel => {
  const data = doc.data()!;
  return postFromFirestore(data, doc.id);
};

export const postToFirestore = (post: PostModel): Record<string, any> => ({
  postId: post.postId,
  username: post.username,
  avatarUrl: post.avatarUrl,
  isVerified: post.isVerified,
  postDescription: post.postDescription,
  content: post.content,
  imageUrl: post.imageUrl,
  likes: post.likes,
  comments: post.comments,
  shares: post.shares,
  uid: post.uid,
  sharedByUid: post.sharedByUid,
  createdAt: post.createdAt,
  isLiked: post.isLiked,
});
