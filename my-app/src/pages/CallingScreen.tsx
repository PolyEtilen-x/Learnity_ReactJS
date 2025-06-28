import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

const CallingScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const callID = searchParams.get("callID") || searchParams.get("roomID");
  const userID = auth.currentUser?.uid;
  const userName = auth.currentUser?.displayName || "Người dùng";

  const [isCallActive, setIsCallActive] = useState(true);

  console.log("callID", callID);
  console.log("userID", userID);
    console.log("userName", userName);
  useEffect(() => {
    if (!callID || !userID || !userName) {
      alert("Thiếu thông tin cuộc gọi.");
      navigate("/messages");
      return;
    }

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
    }, 30000); // 30 giây timeout

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [callID, userID, userName]);

  const endCall = async (reason?: string) => {
    setIsCallActive(false);

    if (callID) {
      await updateDoc(doc(db, "video_calls", callID), {
        status: "cancelled",
      });
    }

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
        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-black px-6 py-3 rounded-full text-lg"
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
