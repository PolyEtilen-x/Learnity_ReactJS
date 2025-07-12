import React, { useEffect, useRef, useState } from "react";
import {
  onSnapshot,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
} from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  getStorage,
} from "firebase/storage";
import { AppBackgroundStyles } from "../theme/theme";
import { useTheme } from "../theme/ThemeProvider";
import EmojiPicker from "emoji-picker-react";
import { IoSend } from "react-icons/io5";
import { FaRegSmile } from "react-icons/fa";
import { FiImage } from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { type AppUser, parseAppUser } from "../models/AppUser";
import MediumProfileImage from "../components/MediumProfileImage";
import ChatUserCard from "../components/ChatUserCard";


const storage = getStorage();

export default function ChatPage() {
  const { isDarkMode } = useTheme();
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  type MessageType = "text" | "image";
  type ChatMessage = {
    id: string;
    toId: string;
    msg: string;
    read: string;
    fromId: string;
    sent: string;
    type: MessageType;
  };

  const handleSelectUser = (user: AppUser) => setSelectedUser(user);

  const generateCallID = (id1: string, id2: string): string => {
    return [id1, id2].sort().join("_");
  };

  const handleVideoCall = async () => {
    if (!selectedUser || !currentUser) return;
    const callID = generateCallID(currentUser.uid, selectedUser.id);

    await setDoc(doc(db, "video_calls", callID), {
      callID: callID,
      callerId: currentUser.uid,
      receiverId: selectedUser.id,
      callerName: currentUser.displayName || "Người gọi",
      receiverName: selectedUser.name,
      startTime: new Date().toISOString(),
      status: "calling",
    });

    navigate(`/calling?callID=${callID}`);
  };

  useEffect(() => {
    if (!currentUser) return;
    const loadUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const fetchedUsers: AppUser[] = snapshot.docs
        .filter((doc) => doc.id !== currentUser.uid)
        .map((doc) => parseAppUser({ ...doc.data(), uid: doc.id }));
      setUsers(fetchedUsers);
    };
    loadUsers();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedUser?.id) return;
    const chatId = [auth.currentUser?.uid, selectedUser.id].sort().join("_");
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("sent"));
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        toId: doc.data().toId || "",
        msg: doc.data().msg || "",
        read: doc.data().read || "",
        fromId: doc.data().fromId || "",
        sent: doc.data().sent || "",
        type: doc.data().type === "image" ? "image" : "text",
      }));
      setMessages(msgs);
    });
    return () => unsub();
  }, [selectedUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !selectedUser?.id) return;
    const chatId = [auth.currentUser?.uid, selectedUser.id].sort().join("_");
    await addDoc(collection(db, "chats", chatId, "messages"), {
      toId: selectedUser.id,
      msg: text,
      read: "",
      fromId: auth.currentUser?.uid || "",
      sent: Date.now().toString(),
      type: "text",
    });
    setText("");
  };

  const sendImage = async (file: File) => {
    if (!file || !selectedUser?.id) return;
    const chatId = [auth.currentUser?.uid, selectedUser.id].sort().join("_");
    setIsUploading(true);
    const imageRef = ref(storage, `chatImages/${uuidv4()}`);
    await uploadBytes(imageRef, file);
    const url = await getDownloadURL(imageRef);
    await addDoc(collection(db, "chats", chatId, "messages"), {
      toId: selectedUser.id,
      msg: url,
      read: "",
      fromId: auth.currentUser?.uid || "",
      sent: Date.now().toString(),
      type: "image",
    });
    setIsUploading(false);
  };

  return (
    <div className="w-screen h-screen pl-[80px]" style={{ backgroundColor: AppBackgroundStyles.mainBackground(isDarkMode) }}>
      <div className="flex h-full w-full">
        <aside className="w-[400px] border-r overflow-y-auto p-4" style={{ backgroundColor: isDarkMode ? "#163B25 " : "#E8F8F6" }}>
          <h2 className="mb-4" style={{color: isDarkMode ? "#fff" : "#000", fontSize: 32, }}>Messages</h2>
          <div className="flex overflow-x-auto space-x-4 mb-4">
            {users.map((user) => (
              <div key={user.id} className="text-center cursor-pointer" onClick={() => handleSelectUser(user)}>
                <MediumProfileImage url={user.avatarUrl} isOnline={user.isOnline} size={56} />
                <div className="text-sm mt-1 w-16 truncate" style={{color : isDarkMode ? "fff" : "000"}}>{user.name}</div>
              </div>
            ))}
          </div>
          {users.map((user) => (
            <ChatUserCard key={user.id} user={user} onClick={() => handleSelectUser(user)} />
          ))}
        </aside>

        <main className="flex-1 flex flex-col">
          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <div className="text-xl font-bold mb-2" style={{color: isDarkMode ? "fff" :"000"}}>Your messages</div>
                <p className="text-xl" style={{color: isDarkMode? "fff" : "000"}}>Select a user to start chatting.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <header className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-3">
                  <img src={selectedUser.avatarUrl || "/default-avatar.png"} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-base" style={{ color : isDarkMode ? "fff" : "000"}}>{selectedUser.name}</p>
                    <p className="text-sm text-gray-500" style={{ color : isDarkMode ? "fff" : "000"}}>@{selectedUser.name || "user"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-500">
                  <button title="Voice Call">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75v10.5a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75zm0 0L12 12l9.75-5.25" />
                    </svg>
                  </button>
                  <button title="Video Call" onClick={handleVideoCall}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6.75A2.25 2.25 0 0013.5 4.5h-9A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5h9a2.25 2.25 0 002.25-2.25v-3.75m0-3l6-3v12l-6-3v-6z" />
                    </svg>
                  </button>
                </div>
              </header>

              <section className="flex-1 overflow-y-auto px-4 py-2 space-y-2" style={{ display: 'flex', flexDirection: 'column' }}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`px-4 py-2 rounded-2xl text-sm max-w-[75%] w-fit ${
                      msg.fromId === auth.currentUser?.uid
                        ? "bg-blue-500 text-white self-end"
                        : "bg-gray-200 text-black self-start"
                    }`}
                  >
                    {msg.type === "text" ? <p>{msg.msg}</p> : <img src={msg.msg} alt="img" className="rounded-lg max-w-xs" />}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </section>

              {isUploading && <div className="text-center py-1">Uploading image...</div>}
              {showEmoji && (
                <div className="bg-gray-100 p-2 rounded-md">
                  <EmojiPicker onEmojiClick={(e) => setText((prev) => prev + e.emoji)} />
                </div>
              )}

              <footer className="mt-2 flex items-center gap-2 px-3 py-2 border rounded-full mx-4 bg-white">
                <button onClick={() => setShowEmoji(!showEmoji)}><FaRegSmile size={22} /></button>
                <input type="text" className="flex-1 px-2 py-1 bg-transparent outline-none" placeholder="Message..." value={text} onChange={(e) => setText(e.target.value)} />
                <input type="file" id="upload-image" accept="image/*" className="hidden" onChange={(e) => e.target.files && sendImage(e.target.files[0])} />
                <label htmlFor="upload-image" className="cursor-pointer"><FiImage size={20} /></label>
                <button onClick={sendMessage} className="text-blue-500"><IoSend size={20} /></button>
              </footer>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}