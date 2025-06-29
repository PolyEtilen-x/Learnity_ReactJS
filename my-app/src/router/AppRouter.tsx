import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Intro from "../pages/Intro";
import Login from "../pages/Login";
import Signup from "../pages/SignUp";
import Home from "../pages/Home";
import PrivateRoute from "../components/PrivateRoute";
import SocialFeedPage from "../pages/SocialFeedPage";
import ProfilePage from "../pages/ProfilePage";
import CreatePostPage from "../pages/CreatePostPage";
import GroupPage from "../pages/GroupPage";
import MessengePage from "../pages/MessengePage";
import VideoCallPage from "../pages/ZegoVideoCall";
import CallingScreen from "../pages/CallingScreen";
import GroupContentPage from "../pages/GroupContentPage";
import CreateGroupPostPage from "../pages/CreatePostGroupPage";
import EditProfilePage from "../pages/EditProfilePage";
import SettingsPage from "../pages/SettingsPage";
import PomodoroPage from "../pages/settings/PomodoroPage";
import NotesPage from "../pages/settings/NotesPage";
import NoteDetailPage from "../pages/settings/NotesDetailPage";
import TheirProfilePage from "../pages/TheirProfilePage"; 
import InviteMemberPage from "../pages/groups/InviteMember";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />      
      <Route path="/" element={<PrivateRoute> <Home /> </PrivateRoute>}>
        <Route path="home" element={<SocialFeedPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="create" element={<CreatePostPage />} />
        <Route path="groups" element={<GroupPage />} />  
        <Route path="groups/:groupId" element={<GroupContentPage />} />
        <Route path="groups/:groupId/create-post" element={<CreateGroupPostPage />} />
        <Route path="messages" element={<MessengePage />} />      
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/pomodoro" element={<PomodoroPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/note/:id" element={<NoteDetailPage sectionId={""} />} />
        <Route path="/profile/:userId" element={<TheirProfilePage />} />
        <Route path="/groups/:groupId/invite" element={<InviteMemberPage />} />

      </Route>

      <Route path="/video-call" element={<VideoCallPage />} />
      <Route path="/calling" element={<CallingScreen />} />
      

      </Routes>
    );
}
