import { useState } from "react";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Schedule from "./components/Schedule.jsx";
import AdminSchedule from "./components/AdminSchedule.jsx";
import Users from "./components/Users.jsx";
import "./App.css";

export default function App() {
  const [activePage, setActivePage] = useState("schedule");
  const [isAdmin, setIsAdmin] = useState(false); // ← важно

  return (
    <div className="app">
      {/* передаём в Header состояние администратора */}
      <Header isAdmin={isAdmin} setIsAdmin={setIsAdmin} />

      <div className="layout">
        <Sidebar setActivePage={setActivePage} />

        <main className="content">
          {/* если админ включён, показываем AdminSchedule */}
          {activePage === "schedule" &&
            (isAdmin ? <AdminSchedule /> : <Schedule />)}
          {activePage === "users" && <Users />}
        </main>
      </div>
    </div>
  );
}
