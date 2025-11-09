import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const [openSchedule, setOpenSchedule] = useState(false);
  const [openUsers, setOpenUsers] = useState(false);
  const [openWorkshops, setOpenWorkshops] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/schedule")) {
      setOpenSchedule(true);
    }

    if (
      location.pathname.startsWith("/artists") ||
      location.pathname.startsWith("/directors") ||
      location.pathname.startsWith("/workers")
    ) {
      setOpenUsers(true);
    }

    if (location.pathname.startsWith("/workers")) {
      setOpenWorkshops(true);
    }
  }, [location.pathname]);

  const navLinkClass = ({ isActive }) =>
    `submenu-link${isActive ? " active" : ""}`;

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
            <NavLink to="/schedule/mouth" className={navLinkClass}>
              Месяц
            </NavLink>
            <NavLink to="/schedule/week" className={navLinkClass}>
              Неделя
            </NavLink>
            <NavLink to="/schedule/day" className={navLinkClass}>
              День
            </NavLink>
          </div>
        </div>

        {/* ====== Пользователи ====== */}
        <div className="menu-item">
          <button className="menu-btn" onClick={() => setOpenUsers(!openUsers)}>
            Пользователи
            <span className={`arrow ${openUsers ? "open" : ""}`}>▼</span>
          </button>

          <div className={`submenu ${openUsers ? "show" : ""}`}>
            <NavLink to="/artists" className={navLinkClass}>
              Артисты
            </NavLink>
            <NavLink to="/directors" className={navLinkClass}>
              Режиссёры
            </NavLink>

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
                <NavLink to="/workers" className={navLinkClass}>
                  Монтировочный цех
                </NavLink>
                <button disabled>Звукорежиссёрский цех</button>
                <button disabled>Светооссветительный цех</button>
                <button disabled>Швейный цех</button>
                <button disabled>Художественный цех</button>
                <button disabled>Парикмахерский цех</button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
