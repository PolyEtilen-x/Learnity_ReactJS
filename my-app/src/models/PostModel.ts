import { Timestamp, type DocumentData, DocumentSnapshot } from "firebase/firestore";

export interface PostModel {
  postId?: string;
  username?: string;
  avatarUrl?: string;
  isVerified: boolean;
  tagList?: string[];
  content?: string;
  imageUrls?: string[]; 
  likes: number;
  comments: number;
  shares: number;
  uid?: string;
  createdAt?: Date;
  isLiked: boolean;
  sharedByUid?: string;
  isHidden?: boolean;
}

export const createEmptyPost = (): PostModel => ({
  postId: "",
  username: "",
  avatarUrl: "",
  isVerified: false,
  tagList: [],
  content: "",
  imageUrls: [],
  likes: 0,
  comments: 0,
  shares: 0,
  uid: "",
  createdAt: new Date(),
  isLiked: false,
  isHidden: false,
});

export const postFromFirestore = (data: any, docId?: string): PostModel => ({
  postId: docId ?? data.postId ?? "",
  username: data.username ?? "",
  avatarUrl: data.avatarUrl ?? "",
  isVerified: data.isVerified ?? false,
  tagList: Array.isArray(data.tagList) ? data.tagList : [],
  content: data.content ?? "",
  imageUrls: Array.isArray(data.imageUrls)
    ? data.imageUrls
    : typeof data.imageUrls === "string"
      ? [data.imageUrls]
      : [],
  likes: data.likes ?? 0,
  comments: data.comments ?? 0,
  shares: data.shares ?? 0,
  uid: data.uid ?? "",
  sharedByUid: data.sharedByUid ?? "",
  createdAt:
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : data.createdAt ?? new Date(),
  isLiked: data.isLiked ?? false,
  isHidden: data.isHidden ?? false,
});

export const postFromDocument = (
  doc: DocumentSnapshot<DocumentData>
): PostModel => {
  const data = doc.data()!;
  return postFromFirestore(data, doc.id);
};

export const postToFirestore = (post: PostModel): Record<string, any> => ({
  postId: post.postId,
  username: post.username,
  avatarUrl: post.avatarUrl,
  isVerified: post.isVerified,
  tagList: post.tagList ?? [],
  content: post.content,
  imageUrls: post.imageUrls ?? [],
  likes: post.likes,
  comments: post.comments,
  shares: post.shares,
  uid: post.uid,
  sharedByUid: post.sharedByUid,
  createdAt: post.createdAt,
  isLiked: post.isLiked,
  isHidden: post.isHidden,
});

export const copyPost = (
  post: PostModel,
  updates: Partial<PostModel>
): PostModel => ({
  ...post,
  ...updates,
});
