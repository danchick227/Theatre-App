import { useState } from "react";
import "./Schedule.css";

export default function Schedule() {
  const monthNames = [
    "ЯНВАРЬ",
    "ФЕВРАЛЬ",
    "МАРТ",
    "АПРЕЛЬ",
    "МАЙ",
    "ИЮНЬ",
    "ИЮЛЬ",
    "АВГУСТ",
    "СЕНТЯБРЬ",
    "ОКТЯБРЬ",
    "НОЯБРЬ",
    "ДЕКАБРЬ",
  ];

  const [currentDate, setCurrentDate] = useState(new Date());

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  // события по сценам
  const scenes = {
    "Большая сцена": [
      {
        title: "Персонаж месяца. Сова + Часовщик",
        time: "11:30–11:50",
        color: "#f4b6b6",
      },
      { title: "Гадкий утенок", time: "12:00–12:55", color: "#cfd6f6" },
    ],
    "Малая сцена": [
      {
        title: "Творческая встреча с артистами",
        time: "13:00–13:30",
        color: "#d9c5f7",
      },
    ],
    "Доп. площадка": [
      { title: "Реп. Муха - Цокотуха", time: "15:00–18:00", color: "#b9ebe0" },
      {
        title: "Спящая царевна. Тех. репетиция",
        time: "15:30–18:00",
        color: "#9fe2b8",
      },
    ],
    "Средняя-сцена": [
      {
        title: "Урок: Театральная студия 'Тяпа'",
        time: "16:30–18:00",
        color: "#f7c6e0",
      },
      {
        title: "Реп. Божественная комедия",
        time: "12:00–14:00",
        color: "#b9ebe0",
      },
    ],
  };

  return (
    <div className="shedule">
      {/* === Переключатель месяца === */}
      <div className="month-switcher">
        <button className="nav-btn" onClick={() => changeMonth(-1)}>
          ‹
        </button>
        <div className="month-label">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button className="nav-btn" onClick={() => changeMonth(1)}>
          ›
        </button>
      </div>

      {/* === Таблица с карточками внутри === */}
      <table className="scene-table">
        <thead>
          <tr>
            {Object.keys(scenes).map((scene) => (
              <th key={scene}>{scene}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {Object.keys(scenes).map((scene) => (
              <td key={scene}>
                <div className="scene-column">
                  {scenes[scene].map((event, i) => (
                    <div
                      key={i}
                      className="event"
                      style={{ backgroundColor: event.color }}
                    >
                      <div className="event-title">{event.title}</div>
                      <div className="event-time">{event.time}</div>
                    </div>
                  ))}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
