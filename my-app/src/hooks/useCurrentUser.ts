import { useEffect, useState } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { type UserInfoModel, userInfoFromFirestore } from "../models/UserInfoModel";

export function useCurrentUser() {
  const [user, setUser] = useState<UserInfoModel | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser: FirebaseUser | null) => {
      if (authUser) {
        const userRef = doc(db, "users", authUser.uid);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          const userInfo = userInfoFromFirestore(data, authUser.uid);
          setUser(userInfo);
        } else {
          // fallback nếu Firestore chưa có tài liệu
          setUser({
            uid: authUser.uid,
            displayName: authUser.displayName || authUser.email || "Người dùng",
            email: authUser.email || undefined,
            avatarUrl: authUser.photoURL || undefined,
            followers: [],
            following: [],
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    displayName: user?.displayName || "",
    avatarUrl: user?.avatarUrl || "",
  };
}
