import { useState } from "react";
import "./Sidebar.css";

export default function Sidebar({ setActivePage }) {
  const [openSchedule, setOpenSchedule] = useState(false);
  const [openUsers, setOpenUsers] = useState(false);

  const [openWorkshops, setOpenWorkshops] = useState(false);

  return (
    <aside className="sidebar">
      <nav className="sidebar-menu">
        {/* ====== Расписание ====== */}
        <div className="menu-item">
          <button
            className="menu-btn"
            onClick={() => setOpenSchedule(!openSchedule)}
          >
            Расписание
            <span className={`arrow ${openSchedule ? "open" : ""}`}>▼</span>
          </button>

          <div className={`submenu ${openSchedule ? "show" : ""}`}>
            <button onClick={() => setActivePage("schedule")}>Месяц</button>
            <button>Неделя</button>
            <button>День</button>
          </div>
        </div>

        {/* ====== Пользователи ====== */}
        <div className="menu-item">
          <button className="menu-btn" onClick={() => setOpenUsers(!openUsers)}>
            Пользователи
            <span className={`arrow ${openUsers ? "open" : ""}`}>▼</span>
          </button>

          <div className={`submenu ${openUsers ? "show" : ""}`}>
            <button onClick={() => setActivePage("artists")}>Артисты</button>
            <button onClick={() => setActivePage("directors")}>Режиссёры</button>

            {/* ====== Цеха ====== */}
            <div className="menu-item">
              <button
                className="menu-btn"
                onClick={() => setOpenWorkshops(!openWorkshops)}
              >
                Цеха
                <span className={`arrow ${openWorkshops ? "open" : ""}`}>
                  ▼
                </span>
              </button>

              <div className={`submenu ${openWorkshops ? "show" : ""}`}>
                <button>Монтировочный цех</button>
                <button>Звукорежиссёрский цех</button>
                <button>Светооссветительный цех</button>
                <button>Швейный цех</button>
                <button>Художественный цех</button>
                <button>Парикмахерский цех</button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
