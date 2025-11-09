import { NavLink } from "react-router-dom";
import "./Schedule.css";

const TABS = [
  { to: "/schedule/mouth", label: "Месяц" },
  { to: "/schedule/week", label: "Неделя" },
  { to: "/schedule/day", label: "День" },
];

export default function ScheduleTabs() {
  return (
    <div className="schedule-tabs">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `schedule-tab${isActive ? " active" : ""}`
          }
          end={tab.to === "/schedule/mouth"}
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
