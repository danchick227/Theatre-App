import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Schedule from "./components/Schedule.jsx";
import ScheduleWeek from "./components/ScheduleWeek.jsx";
import ScheduleDay from "./components/ScheduleDay.jsx";
import Artists from "./components/Users/Artists.jsx";
import Directors from "./components/Users/Directors.jsx"; // добавили режиссёров
import Workers from "./components/Users/Workers.jsx";
import LoginModal from "./components/LoginModal.jsx"; // ← добавили
import { getCurrentUser } from "./api/authApi";
import "./App.css";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false); // ← добавили
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData || null);
    const nextIsAdmin =
      typeof userData?.role === "string" &&
      userData.role.toLowerCase() === "admin";
    setIsAdmin(nextIsAdmin);
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCurrentUser(null);
      setIsAdmin(false);
      return;
    }

    getCurrentUser()
      .then((data) => {
        setCurrentUser(data);
        const nextIsAdmin =
          typeof data?.role === "string" &&
          data.role.toLowerCase() === "admin";
        setIsAdmin(nextIsAdmin);
      })
      .catch(() => {
        setCurrentUser(null);
        setIsAdmin(false);
      });
  }, []);

  return (
    <div className="app">
      <Header
        isAdmin={isAdmin}
        currentUser={currentUser}
        setIsAdmin={setIsAdmin}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginOpen(true)} // ← передаём коллбэк
      />

      <div className="layout">
        <Sidebar />

        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/schedule/mouth" replace />} />
            <Route
              path="/schedule/mouth"
              element={<Schedule isAdmin={isAdmin} currentUser={currentUser} />}
            />
            <Route
              path="/schedule"
              element={<Navigate to="/schedule/mouth" replace />}
            />
            <Route path="/artists" element={<Artists isAdmin={isAdmin} />} />
            <Route path="/directors" element={<Directors isAdmin={isAdmin} />} />
            <Route path="/workers" element={<Workers isAdmin={isAdmin} />} />
            <Route
              path="/schedule/week"
              element={<ScheduleWeek isAdmin={isAdmin} currentUser={currentUser} />}
            />
            <Route
              path="/schedule/day"
              element={<ScheduleDay isAdmin={isAdmin} currentUser={currentUser} />}
            />
            <Route path="*" element={<Navigate to="/schedule/mouth" replace />} />
          </Routes>
        </main>
      </div>

      {/* Модальное окно теперь рендерится поверх всего */}
      {isLoginOpen && (
        <LoginModal
          onClose={() => setIsLoginOpen(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
