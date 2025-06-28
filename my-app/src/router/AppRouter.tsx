import { Routes, Route } from "react-router-dom";
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
      </Route>

      <Route path="/video-call" element={<VideoCallPage />} />
      <Route path="/calling" element={<CallingScreen />} />
      
      {/* Catch-all route for 404 */}

      </Routes>
    );
}
