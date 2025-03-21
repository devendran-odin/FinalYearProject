import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HeroSection from "./Pages/HeroSection";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Navbar from "./Pages/Navbar";
import Mentors from "./Pages/Mentors";
import Chat from "./Pages/Chat";

function App() {
  return (
    <Router>
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg-1.jpg')" }}
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<HeroSection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
