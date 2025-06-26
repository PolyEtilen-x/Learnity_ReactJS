import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

interface CallingScreenState {
  callID: string;
  userID: string;
  userName: string;
}

const CallingScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { callID, userID, userName } = location.state as CallingScreenState;

  const [isCallActive, setIsCallActive] = useState(true);

  useEffect(() => {
    const callDocRef = doc(db, "video_calls", callID);

    const unsubscribe = onSnapshot(callDocRef, (snapshot) => {
      const data = snapshot.data();
      if (!data) return;

      const status = data.status;
      if (status === "accepted") {
        navigate(`/video-call?roomID=${callID}`);
      } else if (status === "rejected") {
        endCall("Người nhận đã từ chối cuộc gọi.");
      }
    });

    const timeout = setTimeout(() => {
      if (isCallActive) {
        endCall("Không có phản hồi từ người nhận.");
      }
    }, 30000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [callID]);

  const endCall = async (reason?: string) => {
    setIsCallActive(false);

    await updateDoc(doc(db, "video_calls", callID), {
      status: "cancelled",
    });

    navigate("/messages");

    if (reason) {
      setTimeout(() => {
        alert(reason);
      }, 300);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white">
      <h2 className="text-xl mb-6 animate-pulse">Đang chờ người nhận...</h2>
      <button
        onClick={() => endCall()}
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full text-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6.75 6.75l10.5 10.5m0-10.5l-10.5 10.5"
          />
        </svg>
        Huỷ cuộc gọi
      </button>
    </div>
  );
};

export default CallingScreen;
