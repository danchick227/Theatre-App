import { useState } from "react";
import "./Sidebar.css";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <aside className="sidebar">
      <nav className="sidebar-menu">
        {/* ====== Расписание ====== */}
        <div className="menu-item">
          <button className="menu-btn" onClick={() => setOpen(!open)}>
            Расписание
            <span className={`arrow ${open ? "open" : ""}`}>▼</span>
          </button>

          {/* Подменю с анимацией */}
          <div className={`submenu ${open ? "show" : ""}`}>
            <button>Месяц</button>
            <button>Неделя</button>
            <button>День</button>
          </div>
        </div>

        {/* ====== Пользователи ====== */}
        <div className="menu-item">
          <button className="menu-btn">Пользователи</button>
        </div>
      </nav>
    </aside>
  );
}
