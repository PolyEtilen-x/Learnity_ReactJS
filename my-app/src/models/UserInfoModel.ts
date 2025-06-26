export interface UserInfoModel {
  uid?: string;
  displayName?: string;
  username?: string;
  followers?: string[];
  following?: string[];
  avatarUrl?: string;
  email?: string;
  bio?: string;
  viewPermission?: string;
}

export const userInfoFromFirestore = (
  data: any,
  uid?: string
): UserInfoModel => {
  return {
    uid: uid || data.uid,
    displayName: data.displayName,
    username: data.username,
    avatarUrl: data.avatarUrl,
    email: data.email,
    bio: data.bio,
    followers: Array.isArray(data.followers) ? data.followers : [],
    following: Array.isArray(data.following) ? data.following : [],
    viewPermission: data.view_permission,
  };
};
