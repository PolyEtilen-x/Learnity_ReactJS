import React, { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../firebaseConfig";

const ZegoVideoCall: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    const APP_ID = 859242371;
    const SERVER_SECRET = "ae23549bccf361980ba54c64575edf12"

    const userID = user?.uid || "";
    const userName = user?.displayName || "Người dùng";
    const roomID = searchParams.get("roomID") || "";
    const TOKEN = ZegoUIKitPrebuilt.generateKitTokenForTest(APP_ID, SERVER_SECRET, roomID, userID, userName);

    console.log("Joining call with:", { roomID, userID, userName });

    if (!roomID || !userID || !userName) {
      alert("Thiếu thông tin cuộc gọi.");
      navigate("/messages");
      return;
    }

    const zp = ZegoUIKitPrebuilt.create(TOKEN);
    zp.joinRoom({
      container: containerRef.current!,
      sharedLinks: [
        {
          name: "Sao chép liên kết",
          url: `${window.location.origin}/video-call?roomID=${roomID}`,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showPreJoinView: false,
      onLeaveRoom: () => navigate("/messages"),
    });
  }, []); 

  return <div ref={containerRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default ZegoVideoCall;
