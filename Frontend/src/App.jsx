import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HeroSection from "./Pages/HeroSection";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Navbar from "./Pages/Navbar";
import Mentors from "./Pages/Mentors";
import Chat from "./Pages/Chat";
import Profile from "./Pages/Profile";
import About from "./Pages/About";
import AiChat from "./Pages/AiChat";
import VideoCall from './Pages/VideoCall';

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg-1.jpg')" }}
      >
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <About />
              </>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/chat" element={<AiChat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/video-call" element={<VideoCall />} />
          <Route path="/video-call/:callId" element={<VideoCall />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
