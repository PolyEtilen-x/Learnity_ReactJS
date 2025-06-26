import { Timestamp } from 'firebase/firestore';

export interface AppUser {
  avatarUrl: string;
  bio: string;
  name: string;
  createdAt: Date;
  isOnline: boolean;
  id: string;
  lastActive: Date;
  email: string;
}

export const parseAppUser = (json: any): AppUser => {
  return {
    avatarUrl: json.avatarUrl ?? '',
    bio: json.bio ?? '',
    name: json.username ?? '',

    createdAt: json.createdAt instanceof Timestamp
      ? json.createdAt.toDate()
      : new Date(json.createdAt || Date.now()),

    isOnline: json.is_online ?? false,
    id: json.uid ?? '',

    lastActive: json.last_active instanceof Timestamp
      ? json.last_active.toDate()
      : new Date(json.last_active || Date.now()),

    email: json.email ?? '',
  };
};

export const serializeAppUser = (user: AppUser) => {
  return {
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    username: user.name,
    createdAt: Timestamp.fromDate(user.createdAt),
    is_online: user.isOnline,
    uid: user.id,
    last_active: Timestamp.fromDate(user.lastActive),
    email: user.email,
  };
};
