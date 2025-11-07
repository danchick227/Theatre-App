import { useState } from "react";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Schedule from "./components/Schedule.jsx";
import AdminSchedule from "./components/AdminSchedule.jsx";
import Artists from "./components/Users/Artists.jsx";
import Directors from "./components/Users/Directors.jsx";// добавили режиссёров
import Workers from "./components/Users/Workers.jsx";
import LoginModal from "./components/LoginModal.jsx"; // ← добавили
import "./App.css";

export default function App() {
  const [activePage, setActivePage] = useState("schedule");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false); // ← добавили

  const handleLoginSuccess = (userData) => {
    setIsAdmin(userData?.role === "admin");
    setIsLoginOpen(false);
  };

  return (
    <div className="app">
      <Header
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        onOpenLogin={() => setIsLoginOpen(true)} // ← передаём коллбэк
      />

      <div className="layout">
        <Sidebar setActivePage={setActivePage} />

        <main className="content">
          {activePage === "schedule" &&
            (isAdmin ? <AdminSchedule /> : <Schedule />)}
          {activePage === "artists" && <Artists isAdmin={isAdmin} />}
          {activePage === "directors" && <Directors isAdmin={isAdmin} />}
          {activePage === "workers" && <Workers isAdmin={isAdmin} />}
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
