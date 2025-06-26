import { doc, onSnapshot, updateDoc, collection, query, where } from "firebase/firestore";
import { Howl } from "howler";
import { db, auth } from "../firebaseConfig";
import { type AppUser } from "../models/AppUser";
import { type ReactNode } from "react";

let unsubscribe: () => void;
let isDialogOpen = false;
let ringtone: Howl | null = null;

type ShowIncomingCallDialogFn = (
  callID: string,
  callerName: string
) => void;

export function startCallListener(showDialog: ShowIncomingCallDialogFn) {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const q = query(
    collection(db, "video_calls"),
    where("receiverId", "==", currentUser.uid)
  );

  unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const data = change.doc.data();
      const callID = data.callID;
      const callerName = data.callerName;
      const status = data.status;

      if (status === "calling" && !isDialogOpen) {
        showDialog(callID, callerName);
        playRingtone();
        isDialogOpen = true;
      } else if (status === "cancelled" || status === "rejected") {
        stopRingtone();
        isDialogOpen = false;
      }
    });
  });
}

export function stopCallListener() {
  if (unsubscribe) unsubscribe();
  stopRingtone();
}

function playRingtone() {
  ringtone = new Howl({
    src: ["/audio/incoming_call.mp3"],
    loop: true,
    volume: 1.0,
  });
  ringtone.play();
}

function stopRingtone() {
  ringtone?.stop();
  ringtone = null;
}
