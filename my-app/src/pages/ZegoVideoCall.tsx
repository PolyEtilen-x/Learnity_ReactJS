import React, { useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useLocation, useNavigate } from "react-router-dom";

// Constants
const APP_ID = 859242371;
const APP_SIGN = "f22df8ec86dc2078d52a9c9f4e9e0dbcb745433328da180d8133849b8d975319";

// Interface
interface CallState {
  callID: string;
  userID: string;
  userName: string;
}

const ZegoVideoCall: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { callID, userID, userName } = location.state as CallState;

  useEffect(() => {
    if (!callID || !userID || !userName) {
      alert("Thiếu thông tin cuộc gọi.");
      navigate("/messages"); // fallback
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
          url: `${window.location.origin}/video-call?callID=${callID}`,
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
