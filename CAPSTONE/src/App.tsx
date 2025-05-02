import "./App.css";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import ResetPassword from "./Pages/ResetPassword";
import AdminHome from "./Pages/AdminHome";
import ProfilePage from "./Pages/ProfilePage";
import GamePage from "./Pages/GamePage";
import AdminSubquest from "./components/AdminComponents/AdminSubquest";
import AdminDialogue from "./components/AdminComponents/AdminDialogue";

function App() {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />}></Route>
        <Route path="/reset-password" element={<ResetPassword />}></Route>
        <Route path="/AdminHome" element={<AdminHome />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/admin/subquests/:questId" element={<AdminSubquest />} />
        <Route
          path="/admin/dialogues/:questId/:subquestId"
          element={<AdminDialogue />}
        />
      </Routes>
    </div>
  );
}

export default App;
