import React from "react";
import { updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";

interface Props {
  callID: string;
  callerName: string;
  userID: string;
  userName: string;
  onClose: () => void;
}

const IncomingCallDialog: React.FC<Props> = ({ callID, callerName, userID, userName, onClose }) => {
  const navigate = useNavigate();

  const rejectCall = async () => {
    await updateDoc(doc(db, "video_calls", callID), { status: "rejected" });
    onClose();
  };

  const acceptCall = async () => {
    await updateDoc(doc(db, "video_calls", callID), { status: "accepted" });
    onClose();
    navigate(`/video-call?roomID=${callID}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="p-6 rounded shadow-md text-center max-w-sm">
        <h3 className="text-lg font-semibold mb-2">{callerName} đang gọi tới</h3>
        <p className="mb-4">Bạn có muốn trả lời cuộc gọi không?</p>
        <div className="flex justify-center gap-4">
          <button className="bg-red-300 text-black px-4 py-2 rounded" onClick={rejectCall}>
            Từ chối
          </button>
          <button className="bg-blue-600 text-black px-4 py-2 rounded" onClick={acceptCall}>
            Trả lời
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallDialog;
