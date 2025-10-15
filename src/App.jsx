import { useState } from "react";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Schedule from "./components/Schedule.jsx";
import Users from "./components/Users.jsx";
import "./App.css";

export default function App() {
  const [activePage, setActivePage] = useState("schedule");

  return (
    <div className="app">
      <Header />

      <div className="layout">
        <Sidebar setActivePage={setActivePage} />

        <main className="content">
          {activePage === "schedule" && <Schedule />}
          {activePage === "users" && <Users />}
        </main>
      </div>
    </div>
  );
}
