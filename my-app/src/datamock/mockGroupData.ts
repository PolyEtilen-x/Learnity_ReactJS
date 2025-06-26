import type { GroupModel } from "../models/GroupModel";

export const joinedGroupMockData: GroupModel[] = [
  {
    id: "1",
    name: "React Devs Việt Nam",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
    privacy: "Công khai",
    createdBy: "user123",
    membersCount: 124,
    createdAt: new Date("2023-12-20"),
  },
  {
    id: "2",
    name: "Học Flutter Từ A-Z",
    avatarUrl: "https://i.pravatar.cc/150?img=4",
    privacy: "Riêng tư",
    createdBy: "user456",
    membersCount: 98,
    createdAt: new Date("2024-01-10"),
  },
];

export const availableGroupMockData: GroupModel[] = [
  {
    id: "3",
    name: "Design UI/UX 101",
    avatarUrl: "https://i.pravatar.cc/150?img=6",
    privacy: "Công khai",
    createdBy: "user789",
    membersCount: 67,
    createdAt: new Date("2024-05-04"),
  },
  {
    id: "4",
    name: "JavaScript Tips & Tricks",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
    privacy: "Riêng tư",
    createdBy: "user321",
    membersCount: 142,
    createdAt: new Date("2024-06-01"),
  },
];
