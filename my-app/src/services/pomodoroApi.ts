import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getAuth } from "firebase/auth";

export interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  lastUpdated?: Date;
}

export const loadPomodoroSettings = async (): Promise<PomodoroSettings> => {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error("Người dùng chưa đăng nhập.");

  const ref = doc(db, "pomodoro_settings", uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    return {
      workMinutes: data.workMinutes ?? 25,
      shortBreakMinutes: data.shortBreakMinutes ?? 5,
      longBreakMinutes: data.longBreakMinutes ?? 15,
      lastUpdated: data.lastUpdated?.toDate?.(),
    };
  }

  return {
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
  };
};

export const savePomodoroSettings = async (settings: PomodoroSettings) => {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error("Người dùng chưa đăng nhập.");

  const ref = doc(db, "pomodoro_settings", uid);
  await setDoc(ref, {
    ...settings,
    lastUpdated: serverTimestamp(),
  });
};
