import { useEffect, useState } from "react";
import IncomingCallDialog from "../src/components/IncomingCallDialog";
import { startCallListener, stopCallListener } from "../src/services/CallService";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

function AppWrapper() {
  const [incomingCall, setIncomingCall] = useState<{
    callID: string;
    callerName: string;
  } | null>(null);

  
useEffect(() => {
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      startCallListener((callID, callerName) => {
        setIncomingCall({ callID, callerName });
      });
    }
  });

  return () => {
    stopCallListener();
    unsubscribeAuth();
  };
}, []);

  const closeDialog = () => setIncomingCall(null);

  return (
    <>
      {incomingCall && auth.currentUser && (
        <IncomingCallDialog
          callID={incomingCall.callID}
          callerName={incomingCall.callerName}
          userID={auth.currentUser.uid}
          userName={auth.currentUser.displayName || "You"}
          onClose={closeDialog}
        />
      )}
    </>
  );
}

export default AppWrapper;