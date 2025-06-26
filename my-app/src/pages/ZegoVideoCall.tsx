import React, { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../firebaseConfig";

const APP_ID = 859242371;
const APP_SIGN = "f22df8ec86dc2078d52a9c9f4e9e0dbcb745433328da180d8133849b8d975319";

const ZegoVideoCall: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const callID = searchParams.get("roomID");
  const userID = auth.currentUser?.uid;
  const userName = auth.currentUser?.displayName || "Người dùng";

  useEffect(() => {
    console.log("callID", callID);
    console.log("userID", userID);
    console.log("userName", userName);
    if (!callID || !userID || !userName) {
      alert("Thiếu thông tin cuộc gọi.");
      navigate("/messages");
      return;
    }

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      APP_ID,
      APP_SIGN,
      callID,
      userID,
      userName
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: containerRef.current!,
      sharedLinks: [
        {
          name: "Sao chép liên kết",
          url: `${window.location.origin}/video-call?roomID=${callID}`,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showPreJoinView: false,
    });
  }, [callID, userID, userName, navigate]);

  return <div ref={containerRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default ZegoVideoCall;
