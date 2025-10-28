import { useState } from "react";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Schedule from "./components/Schedule.jsx";
import AdminSchedule from "./components/AdminSchedule.jsx";
import Artists from "./components/Users/Artists.jsx";
import LoginModal from "./components/LoginModal.jsx"; // ← добавили
import "./App.css";

export default function App() {
  const [activePage, setActivePage] = useState("schedule");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false); // ← добавили

  const handleLoginSuccess = () => {
    setIsAdmin(true);
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
          {activePage === "artists" && <Artists />}
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
